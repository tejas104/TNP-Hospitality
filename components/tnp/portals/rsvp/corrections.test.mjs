import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRsvpAdapter, newRequestId, fingerprint } from './adapter.ts';
import { createFixtures } from './fixtures.ts';
import { buildReport, canExportReport } from './reports.ts';
import { buildPartyRows } from './logic.ts';

const now = Date.parse('2026-09-18T04:30:00Z');
const eventId = 'evt-mehra-udaipur';
function setup(change) {
  const fixtures = createFixtures('2026-09-18');
  const data = fixtures.events[eventId];
  change(data);
  let saved = JSON.stringify({ anchor: '2026-09-18', fixtures, receipts: {}, rowReceipts: {}, importParties: {}, seq: 100 });
  const adapter = createRsvpAdapter({ now: () => now, storage: { getItem: () => saved, setItem: (_k, v) => { saved = v; }, removeItem: () => {} } });
  return {
    read: async () => (await adapter.loadEvent('tnp-manager', eventId)).value,
    mutate: (command) => adapter.mutate('tnp-manager', eventId, newRequestId(), command),
  };
}
function movementFixture(data) {
  const members = data.members.filter((m) => !m.removed).slice(0, 4);
  members.forEach((m) => { m.responses = Object.fromEntries(m.invitedFunctionIds.map((id) => [id, 'confirmed'])); });
  data.vehicles = [{ id: 'car', eventId, label: 'Test car', seats: 3, driver: 'Sample driver' }];
  data.legs = [0, 1].map((i) => ({ ...data.legs[0], id: `leg${i}`, at: '2026-09-20T04:30:00Z', passengerIds: members.slice(i * 2, i * 2 + 2).map((m) => m.id), partyId: members[i * 2].partyId, mode: 'flight' }));
  data.transfers = data.legs.map((l, i) => ({ id: `t${i}`, partyId: l.partyId, legId: l.id, kind: 'pickup', state: i ? 'planned' : 'assigned', vehicleId: i ? null : 'car', planBasedOn: l.at }));
}
test('vehicle assignment counts existing passengers and rejects the entire batch atomically', async () => {
  const s = setup(movementFixture);
  const before = await s.read();
  const result = await s.mutate({ type: 'assign-vehicle', transferIds: ['t1'], vehicleId: 'car', baseVersion: before.dataRevision });
  assert.equal(result.error.code, 'conflict');
  assert.match(result.error.message, /4 passengers exceed 3 seats/);
  assert.deepEqual(await s.read(), before);
});
test('different routes in the same vehicle window conflict even with spare seats', async () => {
  const s = setup((d) => { movementFixture(d); d.vehicles[0].seats = 12; d.legs[1].mode = 'train'; });
  const before = await s.read();
  const result = await s.mutate({ type: 'assign-vehicle', transferIds: ['t1'], vehicleId: 'car', baseVersion: before.dataRevision });
  assert.equal(result.error.code, 'conflict');
  assert.match(result.error.message, /another movement/);
  assert.deepEqual(await s.read(), before);
});
test('assignment in another window succeeds; stale assignments and illegal lifecycle writes do not', async () => {
  const s = setup((d) => { movementFixture(d); d.legs[1].at = '2026-09-20T10:30:00Z'; d.transfers[1].planBasedOn = d.legs[1].at; });
  const before = await s.read();
  assert.equal((await s.mutate({ type: 'assign-vehicle', transferIds: ['t1'], vehicleId: 'car', baseVersion: before.dataRevision })).ok, true);
  assert.equal((await s.mutate({ type: 'assign-vehicle', transferIds: ['t1'], vehicleId: null, baseVersion: before.dataRevision })).error.code, 'stale-version');
  let data = await s.read();
  assert.equal((await s.mutate({ type: 'transfer', transferId: 't1', state: 'completed', baseVersion: data.dataRevision })).error.code, 'validation');
  assert.deepEqual(await s.read(), data);
  assert.equal((await s.mutate({ type: 'transfer', transferId: 't1', state: 'dispatched', baseVersion: data.dataRevision })).ok, true);
  assert.equal((await s.mutate({ type: 'transfer', transferId: 't1', state: 'guest-met', baseVersion: data.dataRevision })).error.code, 'stale-version');
  data = await s.read();
  assert.equal((await s.mutate({ type: 'assign-vehicle', transferIds: ['t1'], vehicleId: null, baseVersion: data.dataRevision })).error.code, 'validation');
  assert.equal((await s.mutate({ type: 'transfer', transferId: 't1', state: 'guest-met', baseVersion: data.dataRevision })).ok, true);
  data = await s.read();
  assert.equal((await s.mutate({ type: 'replan-transfer', transferIds: ['t0', 't1'], baseVersion: data.dataRevision })).error.code, 'validation');
  assert.deepEqual(await s.read(), data);
});
test('stale movement replan and changed travel dispatch are blocked', async () => {
  const s = setup((d) => { movementFixture(d); d.transfers[0].planBasedOn = '2026-09-20T01:30:00Z'; });
  const before = await s.read();
  assert.equal((await s.mutate({ type: 'replan-transfer', transferIds: ['t0'], baseVersion: before.dataRevision - 1 })).error.code, 'stale-version');
  assert.equal((await s.mutate({ type: 'transfer', transferId: 't0', state: 'dispatched', baseVersion: before.dataRevision })).error.code, 'conflict');
  assert.deepEqual(await s.read(), before);
});
function roomFixture(d) {
  d.hotels = [{ id: 'hotel', eventId, name: 'Sample hotel', categories: [{ id: 'room', name: 'Double', inventory: 1, maxOccupancy: 2 }] }];
  d.stays = d.stays.slice(0, 2).map((s, i) => ({ ...s, id: `stay${i}`, state: i ? 'requested' : 'approved', hotelId: i ? null : 'hotel', categoryId: i ? null : 'room', occupantIds: s.occupantIds.slice(0, 2) }));
}
async function propose(s, id, version) {
  const data = await s.read();
  const stay = data.stays.find((x) => x.id === id);
  return s.mutate({ type: 'stay', stayId: id, to: 'proposed', hotelId: 'hotel', categoryId: 'room', baseVersion: version ?? data.parties.find((p) => p.id === stay.partyId).version });
}
test('room proposal rejects exhausted inventory atomically', async () => {
  const s = setup(roomFixture);
  const before = await s.read();
  assert.equal((await propose(s, 'stay1')).error.code, 'conflict');
  assert.deepEqual(await s.read(), before);
});
test('room proposal rejects over-occupancy even with inventory available', async () => {
  const s = setup((d) => { roomFixture(d); d.hotels[0].categories[0].inventory = 10; d.stays[1].occupantIds = ['a', 'b', 'c']; });
  const before = await s.read();
  assert.match((await propose(s, 'stay1')).error.message, /3 occupants exceed/);
  assert.deepEqual(await s.read(), before);
});
test('room reproposal excludes its own hold and rejects a stale version', async () => {
  const s = setup(roomFixture);
  const before = await s.read();
  const version = before.parties.find((p) => p.id === before.stays[0].partyId).version;
  assert.equal((await propose(s, 'stay0')).ok, true);
  const after = await s.read();
  assert.equal(after.stays[0].state, 'proposed');
  assert.equal((await propose(s, 'stay0', version)).error.code, 'stale-version');
  assert.deepEqual(await s.read(), after);
});
test('report export invalidates every changed scope, row, header or revision', async () => {
  const s = setup(() => {});
  const data = await s.read();
  const rows = buildPartyRows(data, now);
  const built = buildReport('master', data, rows);
  const scope = { filter: 'All', built, event: data.event.name };
  const signature = fingerprint(scope);
  const report = await s.mutate({ type: 'generate-report', kind: 'master', filters: 'All', columns: built.columns, scopeSignature: signature });
  assert.equal(canExportReport(report.value, signature, data), true);
  for (const changed of [{ ...scope, filter: 'VIP' }, { ...scope, event: 'Other event' }, { ...scope, built: buildReport('master', data, rows.slice(0, 1)) }]) {
    assert.equal(canExportReport(report.value, fingerprint(changed), data), false);
  }
  assert.equal(canExportReport(report.value, signature, { dataRevision: data.dataRevision + 1 }), false);
  assert.equal(canExportReport({ ...report.value, scopeSignature: undefined }, signature, data), false);
});
test('reduced-motion spinner has no animation or transform', () => {
  const css = readFileSync(new URL('./rsvp.module.css', import.meta.url), 'utf8');
  const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
  assert.match(reduced, /\.spin\s*\{\s*animation: none !important;\s*transform: none !important;/);
  assert.doesNotMatch(reduced, /infinite/);
});
