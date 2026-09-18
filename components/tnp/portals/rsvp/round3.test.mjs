import assert from 'node:assert/strict';
import test from 'node:test';
import { createRsvpAdapter, newRequestId } from './adapter.ts';
import { createFixtures } from './fixtures.ts';
import { previewImport } from './importer.ts';
import { buildManifests } from './logic.ts';
const now = Date.parse('2026-09-18T04:30:00Z');
const eventId = 'evt-mehra-udaipur';
const make = () => createRsvpAdapter({ now: () => now });
const read = async (a) => (await a.loadEvent('tnp-manager', eventId)).value;
const apply = (a, rows, batch = 'r3') => a.applyImport('tnp-manager', eventId, batch, rows);
const csv = 'guest_ref,party_name,member_name,phone,functions\nR3-1,Sample family,Sample Guest,+915550123456,all';

test('accepted identity cannot move slot, including a batch with an earlier new row', async () => {
  const a = make(); const rows = previewImport(csv, null, await read(a)).rows;
  await apply(a, rows); const before = await read(a);
  const moved = structuredClone(rows[0]); moved.rowNumber = 10;
  const fresh = previewImport(csv.replace('R3-1', 'R3-NEW'), null, before).rows[0]; fresh.rowNumber = 3;
  assert.equal((await apply(a, [fresh, moved])).error.code, 'conflict');
  assert.deepEqual(await read(a), before);
  assert.equal((await apply(a, rows)).value[0].replayed, true);
});
for (const outcome of ['rejected', 'unresolved']) {
  test(`first ${outcome} receipt replays exactly and rejects changed material or moved slots`, async () => {
    const a = make(); const d = await read(a);
    const member = d.members.find((m) => m.partyId === d.parties[0].id);
    const text = outcome === 'rejected' ? csv.replace('+915550123456', '12') : `party_name,member_name,phone,functions\nSample family,${member.name},${d.parties[0].phone},all`;
    const rows = previewImport(text, null, d).rows;
    const first = await apply(a, rows); assert.equal(first.value[0].result, outcome);
    const before = await read(a);
    const exact = await apply(a, rows); assert.equal(exact.value[0].replayed, true); assert.equal(exact.value[0].result, outcome);
    const changed = structuredClone(rows); changed[0].values.phone = '+915550999999'; changed[0].status = 'ready';
    assert.equal((await apply(a, changed)).error.code, 'conflict');
    const moved = structuredClone(rows); moved[0].rowNumber = 7;
    assert.equal((await apply(a, moved)).error.code, 'conflict');
    assert.deepEqual(await read(a), before);
  });
}
test('same unseen row key cannot occupy two slots in one request', async () => {
  const a = make(); const before = await read(a); const row = previewImport(csv, null, before).rows[0];
  assert.equal((await apply(a, [row, { ...row, rowNumber: 6 }])).error.code, 'conflict');
  assert.deepEqual(await read(a), before);
});
test('exact failed operational retry and new-batch stable-reference skip remain safe', async () => {
  const a = make(); const rows = previewImport(csv + '\n' + csv.split('\n')[1].replaceAll('R3-1', 'R3-2') + '\n' + csv.split('\n')[1].replaceAll('R3-1', 'R3-3'), null, await read(a)).rows;
  a.setScenario('partial-import'); const first = await apply(a, rows);
  assert.equal(first.value[2].result, 'failed');
  assert.equal((await apply(a, [rows[2]])).value[0].result, 'accepted');
  assert.equal((await apply(a, [rows[2]])).value[0].replayed, true);
  const before = await read(a);
  assert.equal((await apply(a, rows, 'new')).value.every((r) => r.result === 'skipped'), true);
  assert.deepEqual(await read(a), before);
});

function travel() {
  const fixtures = createFixtures('2026-09-18'); const d = fixtures.events[eventId];
  const partyId = fixtures.invitations['mrw-guest-0101'].partyId;
  const members = d.members.filter((m) => m.partyId === partyId);
  members.forEach((m) => { m.responses = Object.fromEntries(m.invitedFunctionIds.map((id) => [id, 'confirmed'])); });
  d.vehicles = [{ id: 'car', eventId, label: 'Test car', seats: 20, driver: 'Sample driver' }];
  d.legs = ['arrival', 'departure'].map((direction, i) => ({ ...d.legs[0], id: `leg-${direction}`, partyId, direction, mode: 'flight', reference: 'SAMPLE-1', from: i ? 'Lake Hotel' : 'Terminal 1', to: i ? 'Terminal 1' : 'Lake Hotel', at: `2026-09-${20 + i}T04:30:00Z`, passengerIds: members.map((m) => m.id) }));
  d.transfers = d.legs.map((l, i) => ({ id: `transfer-${i}`, partyId, legId: l.id, kind: i ? 'drop' : 'pickup', state: 'assigned', vehicleId: 'car', planBasedOn: l.at }));
  let saved = JSON.stringify({ anchor: '2026-09-18', fixtures, receipts: {}, rowReceipts: {}, importParties: {}, seq: 100 });
  return createRsvpAdapter({ now: () => now, storage: { getItem: () => saved, setItem: (_k, v) => { saved = v; }, removeItem: () => {} } });
}
for (const [label, direction, field, value] of [['arrival origin', 'arrival', 'from', '  Terminal   2  '], ['departure destination', 'departure', 'to', '  Terminal   3  '], ['mode only', 'arrival', 'mode', 'bus'], ['reference only', 'arrival', 'reference', '  SAMPLE-2  '], ['time only', 'arrival', 'at', '2026-09-20T10:30:00Z']]) {
  test(`${label} persists and releases its movement until replan and reassignment`, async () => {
    const a = travel(); const before = await read(a); const v = (await a.loadInvitation('mrw-guest-0101')).value;
    const answers = { responses: Object.fromEntries(v.members.map((m) => [m.id, m.responses])), arrival: { ...v.arrival }, departure: { ...v.departure }, pickup: true, drop: true, stay: 'needed', dietary: {}, accessibility: {} };
    answers[direction][field] = value;
    assert.equal((await a.submitInvitation('mrw-guest-0101', newRequestId(), v.party.version, answers)).ok, true);
    let d = await read(a); const leg = d.legs.find((l) => l.direction === direction); const transfer = d.transfers.find((t) => t.legId === leg.id);
    assert.equal(leg[field], value.trim().replace(/\s+/g, ' '));
    assert.equal(transfer.vehicleId, null); assert.equal(transfer.planBasedOn, null); assert.equal(transfer.state, 'planned');
    if (field !== 'at') assert.equal(leg.at, before.legs.find((l) => l.id === leg.id).at);
    assert.equal((await a.mutate('tnp-manager', eventId, newRequestId(), { type: 'transfer', transferId: transfer.id, state: 'dispatched', baseVersion: d.dataRevision })).ok, false);
    assert.equal((await a.mutate('tnp-manager', eventId, newRequestId(), { type: 'assign-vehicle', transferIds: [transfer.id], vehicleId: 'car', baseVersion: d.dataRevision })).error.code, 'conflict');
    assert.equal((await a.mutate('tnp-manager', eventId, newRequestId(), { type: 'replan-transfer', transferIds: [transfer.id], baseVersion: d.dataRevision })).ok, true);
    d = await read(a);
    assert.equal((await a.mutate('tnp-manager', eventId, newRequestId(), { type: 'assign-vehicle', transferIds: [transfer.id], vehicleId: 'car', baseVersion: d.dataRevision })).ok, true);
    d = await read(a);
    assert.equal((await a.mutate('tnp-manager', eventId, newRequestId(), { type: 'transfer', transferId: transfer.id, state: 'dispatched', baseVersion: d.dataRevision })).ok, true);
    const manifest = buildManifests(await read(a)).find((m) => m.transfers.some((t) => t.id === transfer.id));
    assert.ok(manifest.location.includes(leg.from) && manifest.location.includes(leg.to));
    if (field === 'from' || field === 'to' || field === 'mode') assert.notEqual(manifest.id, buildManifests(before).find((m) => m.transfers.some((t) => t.id === transfer.id)).id);
  });
}
