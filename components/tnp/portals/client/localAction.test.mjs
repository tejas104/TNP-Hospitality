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
  const action = {
    storageVersion: 1,
    operation: 'submitBooking',
    fingerprint: 'same-action',
    request: {
      requestKey: 'request-1',
      expectedGeneration: 3,
      actorId: 'actor-1',
      operation: 'submitBooking',
      payload: { city: 'Jaipur' },
    },
    status: 'success',
    receipt: { id: 'booking-1' },
  };
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

test('paid collection without a reference is unconfirmed everywhere', () => {
  assert.deepEqual(collectionPresentation({ status: 'paid', reference: '' }), {
    state: 'unconfirmed',
    label: 'unconfirmed',
    description: 'Reference missing - not treated as paid',
  });
});
