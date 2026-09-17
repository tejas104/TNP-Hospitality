import assert from 'node:assert/strict';
import test from 'node:test';
import {
  actionFingerprint,
  collectionPresentation,
  readAction,
  writeAction,
} from './localAction.ts';

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
  const payload = overrides.payload ?? { city: 'Jaipur' };
  return {
    storageVersion: 1,
    operation: 'submitBooking',
    fingerprint: actionFingerprint('submitBooking', payload),
    request: {
      requestKey: 'request-1',
      expectedGeneration: 3,
      actorId: 'actor-1',
      operation: 'submitBooking',
      payload,
      ...overrides.request,
    },
    status: 'success',
    receipt: { id: 'booking-1', message: 'Saved booking-1.' },
    ...overrides.action,
  };
}

function stored(action) {
  return storage(new Map([['booking', JSON.stringify(action)]]));
}

test('fingerprints are stable and change with material payload', () => {
  const first = actionFingerprint('submitBooking', {
    city: 'Jaipur',
    budget: 4,
  });
  const reordered = actionFingerprint('submitBooking', {
    budget: 4,
    city: 'Jaipur',
  });
  const changed = actionFingerprint('submitBooking', {
    budget: 5,
    city: 'Jaipur',
  });
  assert.equal(first, reordered);
  assert.notEqual(first, changed);
});

test('action journal round trips one request and receipt', () => {
  const target = storage();
  const action = validAction();
  writeAction(target, 'booking', action);
  assert.deepEqual(readAction(target, 'booking', 'submitBooking'), action);
});

test('corrupt journal never becomes a fabricated success', () => {
  const target = storage(new Map([['booking', '{"status":"success"}']]));
  assert.throws(
    () => readAction(target, 'booking', 'submitBooking'),
    /unsupported shape/,
  );
});

test('malformed request metadata is rejected before retry', () => {
  const target = storage(
    new Map([
      [
        'booking',
        JSON.stringify({
          storageVersion: 1,
          operation: 'submitBooking',
          fingerprint: 'same-action',
          status: 'pending',
          request: { requestKey: 'request-1' },
        }),
      ],
    ]),
  );
  assert.throws(
    () => readAction(target, 'booking', 'submitBooking'),
    /unsupported shape/,
  );
});

test('journal rejects mismatched fingerprints and changed payloads under an old fingerprint', () => {
  const action = validAction();
  assert.throws(
    () =>
      readAction(
        stored({ ...action, fingerprint: 'forged' }),
        'booking',
        'submitBooking',
      ),
    /unsupported shape/,
  );
  assert.throws(
    () =>
      readAction(
        stored({
          ...action,
          request: { ...action.request, payload: { city: 'Mumbai' } },
        }),
        'booking',
        'submitBooking',
      ),
    /unsupported shape/,
  );
});

test('journal rejects empty identity and malformed success or error records', () => {
  const action = validAction();
  const invalid = [
    { ...action, request: { ...action.request, requestKey: ' ' } },
    { ...action, request: { ...action.request, actorId: '' } },
    { ...action, receipt: { id: '', message: 'Saved.' } },
    { ...action, receipt: { id: 'booking-1', message: '' } },
    { ...action, status: 'success', receipt: undefined },
    { ...action, status: 'error', receipt: undefined, errorMessage: '' },
    { ...action, status: 'error', receipt: undefined, errorMessage: 42 },
  ];
  for (const candidate of invalid) {
    assert.throws(
      () => readAction(stored(candidate), 'booking', 'submitBooking'),
      /unsupported shape/,
    );
  }
});

test('journal rejects contradictory fields for every status', () => {
  const action = validAction();
  const invalid = [
    { ...action, status: 'pending', receipt: action.receipt },
    { ...action, status: 'pending', receipt: undefined, errorMessage: 'No.' },
    { ...action, status: 'error', errorMessage: 'No.', receipt: action.receipt },
    { ...action, status: 'success', errorMessage: 'No.' },
  ];
  for (const candidate of invalid) {
    assert.throws(
      () => readAction(stored(candidate), 'booking', 'submitBooking'),
      /unsupported shape/,
    );
  }
});

test('valid backward-compatible pending, error and success journals remain readable', () => {
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
      readAction(stored(candidate), 'booking', 'submitBooking'),
      JSON.parse(JSON.stringify(candidate)),
    );
  }
});

test('paid collection without a reference is unconfirmed everywhere', () => {
  assert.deepEqual(collectionPresentation({ status: 'paid', reference: '' }), {
    state: 'unconfirmed',
    label: 'unconfirmed',
    description: 'Reference missing - not treated as paid',
  });
});
