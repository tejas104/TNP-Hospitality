import assert from 'node:assert/strict';
import test from 'node:test';
import { createRsvpAdapter, newRequestId } from './adapter.ts';
import { createFixtures } from './fixtures.ts';
import { previewImport } from './importer.ts';
import { buildManifests } from './logic.ts';

const now = Date.parse('2026-09-18T04:30:00Z');
const eventId = 'evt-mehra-udaipur';
const read = async (a, id = eventId, persona = 'tnp-manager') => {
  const result = await a.loadEvent(persona, id);
  assert.equal(result.ok, true);
  return result.value;
};
const csv = 'guest_ref,party_name,member_name,phone,email,functions,priority,language,allowed_accompanying\nROUND2-1,Sample family,Sample Guest,+915550123456,guest@example.test,all,standard,English,1';
const rowsFor = (d, text = csv) => previewImport(text, null, d).rows;
const make = () => createRsvpAdapter({ now: () => now });
function makeWithSecondEvent() {
  const fixtures = createFixtures('2026-09-18');
  fixtures.events['evt-mehra-delhi'] = JSON.parse(JSON.stringify(fixtures.events[eventId]).replaceAll(eventId, 'evt-mehra-delhi'));
  let saved = JSON.stringify({ anchor: '2026-09-18', fixtures, receipts: {}, rowReceipts: {}, importParties: {}, seq: 100 });
  return createRsvpAdapter({ now: () => now, storage: { getItem: () => saved, setItem: (_k, value) => { saved = value; }, removeItem: () => {} } });
}
const apply = (a, rows, batch = 'round2-batch', id = eventId, persona = 'tnp-manager') => a.applyImport(persona, id, batch, rows);

test('exact import receipt replays without mutation and does not leak mutable request arrays', async () => {
  const a = make();
  const rows = rowsFor(await read(a));
  const first = await apply(a, rows);
  assert.equal(first.value[0].result, 'accepted');
  const after = await read(a);
  const replay = await apply(a, structuredClone(rows));
  assert.equal(replay.value[0].replayed, true);
  assert.deepEqual(await read(a), after);
  rows[0].functionIds.push('changed-by-caller');
  assert.deepEqual(await read(a), after);
});

for (const [field, value] of [['phone', '+915559999999'], ['email', 'changed@example.test'], ['functions', 'different'], ['party_name', 'Changed family'], ['priority', 'vip'], ['language', 'Hindi'], ['allowed_accompanying', '9'], ['member_name', 'Changed Guest'], ['age_band', 'child'], ['guest_ref', 'OTHER-REF']]) {
  test(`same batch changed ${field} conflicts before any row mutates`, async () => {
    const a = make();
    const rows = rowsFor(await read(a));
    await apply(a, rows);
    const before = await read(a);
    const changed = structuredClone(rows);
    changed[0].values[field] = value;
    const fresh = rowsFor(before, csv.replace('ROUND2-1', 'NEW-ROW'))[0];
    fresh.rowNumber = 3; fresh.key = 'fresh-row';
    const result = await apply(a, [fresh, changed[0]]);
    assert.equal(result.error.code, 'conflict');
    assert.deepEqual(await read(a), before);
  });
}
test('changed resolved functions and regenerated row keys cannot evade import identity', async () => {
  const a = make(); const rows = rowsFor(await read(a)); await apply(a, rows);
  const before = await read(a);
  const resolved = structuredClone(rows); resolved[0].functionIds = resolved[0].functionIds.slice(1);
  assert.equal((await apply(a, resolved)).error.code, 'conflict');
  const regenerated = rowsFor(before, csv.replace('Sample family', 'Changed family'));
  assert.notEqual(regenerated[0].key, rows[0].key);
  assert.equal((await apply(a, regenerated)).error.code, 'conflict');
  assert.deepEqual(await read(a), before);
});

for (const [label, otherId, persona] of [['same-org other-event', 'evt-mehra-delhi', 'tnp-manager'], ['other-org other-event', 'evt-kapoor-jaipur', 'marigold-owner'], ['same-event other-persona', eventId, 'customer-mehra']]) {
  test(`import receipts and household mappings isolate ${label}`, async () => {
    const a = makeWithSecondEvent(); const firstData = await read(a); const source = rowsFor(firstData);
    await apply(a, source);
    const targetBefore = await read(a, otherId, persona);
    const targetRows = rowsFor(targetBefore);
    // Same raw row key and batch deliberately; function IDs remain scoped to the target.
    const result = await apply(a, targetRows, 'round2-batch', otherId, persona);
    assert.equal(result.ok, true);
    assert.equal(result.value[0].replayed, false);
    if (otherId === eventId) {
      assert.equal(result.value[0].result, 'skipped');
      assert.deepEqual(await read(a), targetBefore);
    } else {
      assert.equal(result.value[0].result, 'accepted');
      const target = await read(a, otherId, persona);
      const imported = target.parties.find((p) => p.ref === 'ROUND2-1');
      assert.equal(imported.eventId, otherId);
      assert.equal(imported.orgId, target.event.orgId);
      assert.equal(target.members.filter((m) => m.partyId === imported.id).length, 1);
      assert.notEqual(imported.id, (await read(a)).parties.find((p) => p.ref === 'ROUND2-1').id);
    }
  });
}
test('failed-row retry binds material, then succeeds once; new batch skips stable reference', async () => {
  const a = make(); const data = await read(a);
  const rows = rowsFor(data, csv + '\n' + csv.split('\n')[1].replaceAll('ROUND2-1', 'ROUND2-2').replace('Sample Guest', 'Guest Two') + '\n' + csv.split('\n')[1].replaceAll('ROUND2-1', 'ROUND2-3').replace('Sample Guest', 'Guest Three'));
  a.setScenario('partial-import');
  const first = await apply(a, rows);
  assert.deepEqual(first.value.map((r) => r.result), ['accepted', 'accepted', 'failed']);
  const before = await read(a);
  const altered = structuredClone(rows[2]); altered.values.phone = '+915550000000';
  assert.equal((await apply(a, [altered])).error.code, 'conflict');
  assert.deepEqual(await read(a), before);
  assert.equal((await apply(a, [rows[2]])).value[0].result, 'accepted');
  assert.equal((await apply(a, rows)).value.every((r) => r.replayed), true);
  const after = await read(a);
  assert.equal((await apply(a, rowsFor(after), 'new-batch')).value[0].result, 'skipped');
  assert.deepEqual(await read(a), after);
});

function routes(change = () => {}) {
  const fixtures = createFixtures('2026-09-18'); const d = fixtures.events[eventId];
  const members = d.members.filter((m) => !m.removed).slice(0, 4);
  members.forEach((m) => { m.responses = Object.fromEntries(m.invitedFunctionIds.map((id) => [id, 'confirmed'])); });
  d.vehicles = [{ id: 'car', eventId, label: 'Test car', seats: 12, driver: 'Sample driver' }];
  d.legs = [0, 1].map((i) => ({ ...d.legs[0], id: `leg${i}`, at: '2026-09-20T04:30:00Z', passengerIds: members.slice(i * 2, i * 2 + 2).map((m) => m.id), partyId: members[i * 2].partyId, mode: 'flight', from: 'Delhi terminal 1', to: 'Lake Hotel', direction: 'arrival' }));
  d.transfers = d.legs.map((l, i) => ({ id: `t${i}`, partyId: l.partyId, legId: l.id, kind: 'pickup', state: i ? 'planned' : 'assigned', vehicleId: i ? null : 'car', planBasedOn: l.at }));
  change(d);
  let saved = JSON.stringify({ anchor: '2026-09-18', fixtures, receipts: {}, rowReceipts: {}, importParties: {}, seq: 100 });
  return createRsvpAdapter({ now: () => now, storage: { getItem: () => saved, setItem: (_k, v) => { saved = v; }, removeItem: () => {} } });
}
async function assign(a) { const d = await read(a); return a.mutate('tnp-manager', eventId, newRequestId(), { type: 'assign-vehicle', transferIds: ['t1'], vehicleId: 'car', baseVersion: d.dataRevision }); }
test('normalized true same route aggregates and checks complete capacity', async () => {
  const a = routes((d) => { d.legs[1].from = '  DELHI   terminal 1 '; d.legs[1].to = 'lake hotel'; });
  assert.equal((await assign(a)).ok, true);
  const manifests = buildManifests(await read(a)); assert.equal(manifests.length, 1); assert.equal(manifests[0].passengers, 4);
  const limited = routes((d) => { d.vehicles[0].seats = 3; });
  const before = await read(limited);
  assert.match((await assign(limited)).error.message, /4 passengers exceed 3 seats/);
  assert.deepEqual(await read(limited), before);
});
for (const [label, change] of [['flight/train', (d) => { d.legs[1].mode = 'train'; }], ['flight/bus', (d) => { d.legs[1].mode = 'bus'; }], ['different origin', (d) => { d.legs[1].from = 'Delhi terminal 2'; }], ['different destination', (d) => { d.legs[1].to = 'Garden Hotel'; }], ['different direction', (d) => { d.legs[1].direction = 'departure'; }]]) {
  test(`same window rejects ${String(label)} routes atomically with spare capacity`, async () => {
    const a = routes(change); const before = await read(a);
    assert.match((await assign(a)).error.message, /another movement/);
    assert.deepEqual(await read(a), before);
  });
}
test('different route in another window is allowed while stale and illegal writes remain blocked', async () => {
  const a = routes((d) => { d.legs[1].to = 'Other Hotel'; d.legs[1].at = '2026-09-20T10:30:00Z'; d.transfers[1].planBasedOn = d.legs[1].at; });
  const before = await read(a); assert.equal((await assign(a)).ok, true);
  for (const command of [{ type: 'assign-vehicle', transferIds: ['t1'], vehicleId: null }, { type: 'replan-transfer', transferIds: ['t1'] }, { type: 'transfer', transferId: 't1', state: 'dispatched' }]) {
    assert.equal((await a.mutate('tnp-manager', eventId, newRequestId(), { ...command, baseVersion: before.dataRevision })).error.code, 'stale-version');
  }
  const latest = await read(a);
  assert.equal((await a.mutate('tnp-manager', eventId, newRequestId(), { type: 'transfer', transferId: 't1', state: 'completed', baseVersion: latest.dataRevision })).error.code, 'validation');
  assert.deepEqual(await read(a), latest);
});

test('flight and bus drop routes cannot collapse into the old Airport label', async () => {
  const a = routes((d) => {
    d.transfers.forEach((t) => { t.kind = 'drop'; });
    d.legs.forEach((leg) => { leg.direction = 'departure'; leg.from = 'Lake Hotel'; leg.to = 'City terminal'; });
    d.legs[1].mode = 'bus';
  });
  const before = await read(a);
  assert.match((await assign(a)).error.message, /another movement/);
  assert.deepEqual(await read(a), before);
});
