import assert from 'node:assert/strict';
import test from 'node:test';
import {
  actionFingerprint,
  isValidReferencePair,
  readAction,
  reconcileReferencePair,
  writeAction,
} from './localAction.ts';

const bookings = [{ id: 'booking-a' }, { id: 'booking-b' }];
const events = [
  { id: 'event-a', bookingId: 'booking-a' },
  { id: 'event-b', bookingId: 'booking-b' },
];

function storage(initial = new Map()) {
  return {
    values: initial,
    getItem(key) {
      return this.values.get(key) ?? null;
    },
    setItem(key, value) {
      this.values.set(key, value);
    },
    removeItem(key) {
      this.values.delete(key);
    },
  };
}

function validAction(overrides = {}) {
  const payload = overrides.payload ?? {
    bookingId: 'booking-a',
    eventId: 'event-a',
    role: 'Hostess',
    quantity: 2,
    notes: '',
    status: 'submitted',
  };
  return {
    storageVersion: 1,
    operation: 'submitRequirement',
    fingerprint: actionFingerprint('submitRequirement', payload),
    request: {
      requestKey: 'requirement-1',
      expectedGeneration: 3,
      actorId: 'planner-1',
      operation: 'submitRequirement',
      payload,
      ...overrides.request,
    },
    status: 'success',
    receipt: { id: 'requirement-1', message: 'Saved requirement-1.' },
    ...overrides.action,
  };
}

function stored(action) {
  return storage(new Map([['requirement', JSON.stringify(action)]]));
}

test('reconcile retains only an event belonging to the retained booking', () => {
  assert.deepEqual(
    reconcileReferencePair(bookings, events, {
      bookingId: 'booking-a',
      eventId: 'event-b',
    }),
    { bookingId: 'booking-a', eventId: 'event-a' },
  );
});

test('invalid stored IDs fall back to a valid connected pair', () => {
  assert.deepEqual(
    reconcileReferencePair(bookings, events, {
      bookingId: 'missing',
      eventId: 'missing',
    }),
    { bookingId: 'booking-a', eventId: 'event-a' },
  );
});

test('pair validation rejects a real event linked to another booking', () => {
  assert.equal(
    isValidReferencePair(bookings, events, 'booking-a', 'event-b'),
    false,
  );
});

test('planner journal round trips a valid existing success record', () => {
  const target = storage();
  const action = validAction();
  writeAction(target, 'requirement', action);
  assert.deepEqual(
    readAction(target, 'requirement', 'submitRequirement'),
    action,
  );
});

test('planner journal rejects mismatched fingerprints and payload substitution', () => {
  const action = validAction();
  const changedPayload = { ...action.request.payload, quantity: 9 };
  for (const candidate of [
    { ...action, fingerprint: 'forged' },
    { ...action, request: { ...action.request, payload: changedPayload } },
  ]) {
    assert.throws(
      () =>
        readAction(stored(candidate), 'requirement', 'submitRequirement'),
      /unsupported shape/,
    );
  }
});

test('planner journal rejects empty identity and malformed status fields', () => {
  const action = validAction();
  const invalid = [
    { ...action, request: { ...action.request, requestKey: '' } },
    { ...action, request: { ...action.request, actorId: ' ' } },
    { ...action, receipt: { id: '', message: 'Saved.' } },
    { ...action, receipt: { id: 'requirement-1', message: '' } },
    { ...action, receipt: undefined },
    { ...action, status: 'error', receipt: undefined, errorMessage: '' },
    { ...action, status: 'error', receipt: undefined, errorMessage: 7 },
  ];
  for (const candidate of invalid) {
    assert.throws(
      () =>
        readAction(stored(candidate), 'requirement', 'submitRequirement'),
      /unsupported shape/,
    );
  }
});

test('planner journal rejects contradictory status fields', () => {
  const action = validAction();
  const invalid = [
    { ...action, status: 'pending' },
    { ...action, status: 'pending', receipt: undefined, errorMessage: 'No.' },
    { ...action, status: 'error', errorMessage: 'No.' },
    { ...action, status: 'success', errorMessage: 'No.' },
  ];
  for (const candidate of invalid) {
    assert.throws(
      () =>
        readAction(stored(candidate), 'requirement', 'submitRequirement'),
      /unsupported shape/,
    );
  }
});

test('planner journal preserves valid pending, error and success records', () => {
  const success = validAction();
  const pending = { ...success, status: 'pending', receipt: undefined };
  const error = {
    ...success,
    status: 'error',
    receipt: undefined,
    errorMessage: 'VALIDATION: Correct the sample fields.',
  };
  for (const candidate of [pending, error, success]) {
    assert.deepEqual(
      readAction(stored(candidate), 'requirement', 'submitRequirement'),
      JSON.parse(JSON.stringify(candidate)),
    );
  }
});
