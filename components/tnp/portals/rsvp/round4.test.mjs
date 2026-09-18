import assert from 'node:assert/strict';
import test from 'node:test';
import { createRsvpAdapter, newRequestId } from './adapter.ts';
import { createFixtures } from './fixtures.ts';
import { previewImport } from './importer.ts';
const eventId = 'evt-mehra-udaipur';
const now = () => Date.parse('2026-09-18T04:30:00Z');
const read = async (a) => (await a.loadEvent('tnp-manager', eventId)).value;
const header = 'party_name,member_name,phone,functions';
const alice = 'Sample household,Alice Sample,+915550123456,all';
const bob = 'Sample household,Bob Sample,+915550123456,all';
for (const [label, changedCsv] of [['blank line', `${header}\n\n${alice}\n${bob}`], ['reordering', `${header}\n${bob}\n${alice}`]]) {
  test(`actual parser ${label} cannot duplicate batch material`, async () => {
    const a = createRsvpAdapter({ now }); const initial = await read(a);
    const rows = previewImport(`${header}\n${alice}\n${bob}`, null, initial).rows;
    const first = await a.applyImport('tnp-manager', eventId, 'batch', rows);
    assert.equal(first.value.every((r) => r.result === 'accepted'), true);
    const before = await read(a);
    assert.equal(before.parties.length, initial.parties.length + 1);
    assert.equal(before.members.length, initial.members.length + 2);
    const moved = previewImport(changedCsv, null, before).rows;
    assert.notEqual(moved.find((r) => r.values.member_name === 'Alice Sample').key, rows[0].key);
    assert.equal((await a.applyImport('tnp-manager', eventId, 'batch', moved)).error.code, 'conflict');
    assert.deepEqual(await read(a), before);
    assert.equal((await a.applyImport('tnp-manager', eventId, 'batch', rows)).value.every((r) => r.replayed), true);
  });
}
test('fresh row preceding material moved to a free slot is rejected atomically', async () => {
  const a = createRsvpAdapter({ now }); const d = await read(a);
  await a.applyImport('tnp-manager', eventId, 'batch', previewImport(`${header}\n${alice}`, null, d).rows);
  const before = await read(a);
  const rows = previewImport(`${header}\n\n${bob}\n${alice}`, null, before).rows;
  assert.equal((await a.applyImport('tnp-manager', eventId, 'batch', rows)).error.code, 'conflict');
  assert.deepEqual(await read(a), before);
});
test('same material twice in a first request rejects before household creation', async () => {
  const a = createRsvpAdapter({ now }); const before = await read(a);
  const rows = previewImport(`${header}\n${alice}\n${alice}`, null, before).rows;
  assert.equal((await a.applyImport('tnp-manager', eventId, 'batch', rows)).error.code, 'conflict');
  assert.deepEqual(await read(a), before);
});
for (const direction of ['arrival', 'departure']) {
  test(`clearing known ${direction} persists null and blocks every dependent movement until details and planning`, async () => {
    const fixtures = createFixtures('2026-09-18'); const d = fixtures.events[eventId];
    const token = 'mrw-guest-0101'; const partyId = fixtures.invitations[token].partyId;
    const members = d.members.filter((m) => m.partyId === partyId);
    members.forEach((m) => { m.responses = Object.fromEntries(m.invitedFunctionIds.map((id) => [id, 'confirmed'])); });
    d.legs = [{ ...d.legs[0], id: 'known', partyId, direction, from: 'Terminal 1', to: 'Lake Hotel', mode: 'flight', reference: 'SAMPLE', at: '2026-09-20T04:30:00Z', passengerIds: members.map((m) => m.id) }];
    d.vehicles = [{ id: 'car', eventId, label: 'Sample car', seats: 20, driver: 'Sample driver' }];
    d.transfers = ['assigned', 'dispatched'].map((state, i) => ({ id: `t${i}`, partyId, legId: 'known', kind: direction === 'arrival' ? 'pickup' : 'drop', state, vehicleId: 'car', planBasedOn: d.legs[0].at }));
    let saved = JSON.stringify({ anchor: '2026-09-18', fixtures, receipts: {}, rowReceipts: {}, importParties: {}, seq: 1 });
    const storage = { getItem: () => saved, setItem: (_k, v) => { saved = v; } };
    let a = createRsvpAdapter({ now, storage }); const v = (await a.loadInvitation(token)).value;
    const answers = { responses: Object.fromEntries(v.members.map((m) => [m.id, m.responses])), arrival: null, departure: null, pickup: direction === 'arrival', drop: direction === 'departure', stay: 'needed', dietary: {}, accessibility: {} };
    assert.equal((await a.submitInvitation(token, newRequestId(), v.party.version, answers)).ok, true);
    a = createRsvpAdapter({ now, storage });
    assert.equal((await a.loadInvitation(token)).value[direction], null);
    let current = await read(a); assert.equal(current.legs.length, 0);
    for (const t of current.transfers) {
      assert.equal(t.legId, null); assert.equal(t.vehicleId, null); assert.equal(t.planBasedOn, null); assert.equal(t.state, 'awaiting-details');
      for (const cmd of [{ type: 'transfer', transferId: t.id, state: 'dispatched' }, { type: 'assign-vehicle', transferIds: [t.id], vehicleId: 'car' }, { type: 'replan-transfer', transferIds: [t.id] }]) assert.equal((await a.mutate('tnp-manager', eventId, newRequestId(), { ...cmd, baseVersion: current.dataRevision })).ok, false);
    }
    assert.deepEqual(await read(a), current);
    const latest = (await a.loadInvitation(token)).value;
    answers[direction] = v[direction];
    assert.equal((await a.submitInvitation(token, newRequestId(), latest.party.version, answers)).ok, true);
    current = await read(a);
    assert.equal(current.transfers.every((t) => t.legId === current.legs[0].id && t.vehicleId === null && t.planBasedOn === null), true);
    assert.equal((await a.mutate('tnp-manager', eventId, newRequestId(), { type: 'assign-vehicle', transferIds: ['t0'], vehicleId: 'car', baseVersion: current.dataRevision })).ok, false);
    assert.equal((await a.mutate('tnp-manager', eventId, newRequestId(), { type: 'transfer', transferId: 't0', state: 'planned', baseVersion: current.dataRevision })).ok, true);
    current = await read(a);
    assert.equal((await a.mutate('tnp-manager', eventId, newRequestId(), { type: 'assign-vehicle', transferIds: ['t0'], vehicleId: 'car', baseVersion: current.dataRevision })).ok, true);
    current = await read(a);
    assert.equal((await a.mutate('tnp-manager', eventId, newRequestId(), { type: 'transfer', transferId: 't0', state: 'dispatched', baseVersion: current.dataRevision })).ok, true);
  });
}
