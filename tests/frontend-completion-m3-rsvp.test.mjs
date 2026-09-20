import test from 'node:test';
import assert from 'node:assert/strict';
import {
  initialRsvp,
  scopeGuests,
  updateReply,
  importGuests,
  reportCsv,
  readRsvp,
} from '../components/tnp/portals/rsvp/rsvp-state.ts';
test('RSVP repeated human names never cross organization or event scope', () => {
  const s = initialRsvp();
  assert.equal(scopeGuests(s, 'lotus').length, 4);
  assert.equal(scopeGuests(s, 'marigold').length, 2);
  assert.equal(scopeGuests(s, 'lotus', 'marigold-evening').length, 0);
  assert.throws(() =>
    updateReply(s, 'lotus', 'marigold-evening', 'marigold-evening-1', 'yes', 2),
  );
  assert.throws(() =>
    updateReply(s, 'lotus', 'lotus-evening', 'lotus-welcome-1', 'yes', 2),
  );
  const next = updateReply(
    s,
    'lotus',
    'lotus-evening',
    'lotus-evening-1',
    'yes',
    3,
  );
  assert.equal(next.guests[0].original, s.guests[0].original);
  assert.equal(next.guests[0].reviewed, true);
  assert.equal(next.guests[2].reviewed, false);
  assert.throws(() =>
    updateReply(s, 'lotus', 'lotus-evening', 'lotus-evening-1', 'invalid', 2),
  );
  assert.throws(() =>
    updateReply(s, 'lotus', 'lotus-evening', 'lotus-evening-1', 'yes', 31),
  );
});
test('RSVP import is atomic, validated and CSV export neutralizes formulas', () => {
  const rows = importGuests(
    'name,party,people\n=2+2,Sample A,2',
    'lotus',
    'lotus-evening',
    'nonce',
  );
  assert.equal(rows[0].reply, 'pending');
  assert.match(reportCsv(rows), /"'=2\+2"/);
  for (const text of [
    'name,party,people',
    'name,party,people\nSample,A,2\nBroken,B,0',
    'name,party,people\nSample,A,2,extra',
  ])
    assert.throws(() => importGuests(text, 'lotus', 'lotus-evening', 'nonce'));
  assert.throws(() =>
    importGuests(
      'name,party,people\nSample,A,2',
      'lotus',
      'marigold-evening',
      'nonce',
    ),
  );
});
test('corrupt RSVP persistence recovers without rendering malformed campaign data', () => {
  const initial = initialRsvp();
  assert.deepEqual(readRsvp('broken'), initial);
  assert.deepEqual(
    readRsvp(JSON.stringify({ ...initial, campaigns: [null] })),
    initial,
  );
  assert.deepEqual(
    readRsvp(
      JSON.stringify({
        ...initial,
        campaigns: [
          {
            id: 'x',
            org: 'lotus',
            event: 'marigold-evening',
            text: 'x',
            state: 'draft',
          },
        ],
      }),
    ),
    initial,
  );
  const valid = {
    ...initial,
    campaigns: [
      {
        id: 'x',
        org: 'lotus',
        event: 'lotus-evening',
        text: 'Sample only',
        state: 'draft',
      },
    ],
  };
  assert.deepEqual(readRsvp(JSON.stringify(valid)), valid);
});

import { canUseRsvp } from '../components/tnp/portals/rsvp/rsvp-state.ts';
test('RSVP presentation gates combine entitlement dates and named capability', () => {
  assert.equal(canUseRsvp('active', 'manager', '2026-09-24', 'export'), true);
  assert.equal(canUseRsvp('active', 'operator', '2026-09-24', 'review'), true);
  for (const [state, role, date, cap] of [
    ['suspended', 'manager', '2026-09-24', 'review'],
    ['active', 'viewer', '2026-09-24', 'review'],
    ['active', 'operator', '2026-09-24', 'export'],
    ['active', 'manager', '2026-10-01', 'export'],
    ['active', 'manager', '', 'review'],
  ])
    assert.equal(canUseRsvp(state, role, date, cap), false);
});
