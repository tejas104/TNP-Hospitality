import assert from 'node:assert/strict';
import test from 'node:test';
import { isValidReferencePair, reconcileReferencePair } from './localAction.ts';

const bookings = [{ id: 'booking-a' }, { id: 'booking-b' }];
const events = [
  { id: 'event-a', bookingId: 'booking-a' },
  { id: 'event-b', bookingId: 'booking-b' },
];

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
