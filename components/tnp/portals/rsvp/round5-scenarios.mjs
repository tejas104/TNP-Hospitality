import { createRsvpAdapter, fingerprint, newRequestId } from './adapter.ts';
import { createFixtures } from './fixtures.ts';
import { previewImport } from './importer.ts';
import { buildManifests } from './logic.ts';
const check = (value, message) => { if (!value) throw new Error(message); };
const same = (a, b) => fingerprint(a) === fingerprint(b);
const eventId = 'evt-mehra-udaipur';
const now = () => Date.parse('2026-09-18T04:30:00Z');
const read = async (a) => (await a.loadEvent('tnp-manager', eventId)).value;
function store(state) {
  let saved = JSON.stringify(state);
  return { getItem: () => saved, setItem: (_k, value) => { saved = value; }, removeItem: () => {} };
}
export async function historicalImport() {
  const fixtures = createFixtures('2026-09-18'); const data = fixtures.events[eventId];
  const header = 'party_name,member_name,phone,functions'; const row = 'Sample household,Sample member,+915550123456,all';
  const rows = previewImport(`${header}\n${row}\n${row}`, null, data).rows;
  check(rows[1].status === 'duplicate', 'real parser duplicate');
  const scope = { orgId: data.event.orgId, eventId, personaId: 'tnp-manager', batchId: 'retained' };
  const receipts = Object.fromEntries(rows.map((r, i) => [`v2:${fingerprint({ ...scope, rowNumber: r.rowNumber })}`, {
    fingerprint: fingerprint({ rowKey: r.key, partyKey: r.partyKey, values: Object.fromEntries(Object.entries(r.values).map(([k, v]) => [k, v.normalize('NFKC').replace(/\s+/g, ' ').trim()])), functionIds: [...new Set(r.functionIds)].sort() }),
    outcome: { rowNumber: r.rowNumber, key: r.key, result: i ? 'rejected' : 'accepted', reason: i ? 'Duplicate source row' : 'Imported', replayed: false },
  }]));
  const a = createRsvpAdapter({ now, storage: store({ anchor: '2026-09-18', fixtures, receipts: {}, rowReceipts: receipts, importParties: {}, seq: 1 }) });
  const before = await read(a);
  for (const input of [rows, [rows[0]], [rows[1]], [...rows].reverse()]) {
    const replay = await a.applyImport('tnp-manager', eventId, 'retained', input);
    check(replay.ok && replay.value.every((r, i) => r.replayed && r.result === (input[i].rowNumber === 2 ? 'accepted' : 'rejected')), 'exact retained outcomes replay');
  }
  const moved = previewImport(`${header}\n\n\n${row}`, null, data).rows;
  const fresh = previewImport(`${header}\n\n\n\nSample family,New member,+915550987654,all`, null, data).rows;
  check(!(await a.applyImport('tnp-manager', eventId, 'retained', [...fresh, ...moved])).ok, 'moved material rejects atomically');
  check(same(before, await read(a)), 'no event mutation');
  return true;
}
export async function historicalTravel(direction) {
  const fixtures = createFixtures('2026-09-18'); const data = fixtures.events[eventId];
  const token = 'mrw-guest-0101'; const partyId = fixtures.invitations[token].partyId;
  const members = data.members.filter((m) => m.partyId === partyId);
  members.forEach((m) => { m.responses = Object.fromEntries(m.invitedFunctionIds.map((id) => [id, 'confirmed'])); });
  const legId = `${partyId}-${direction === 'arrival' ? 'arr' : 'dep'}`;
  data.legs = [{ ...data.legs[0], id: legId, partyId, direction, from: 'Terminal 1', to: 'Lake Hotel', mode: 'flight', reference: 'SAMPLE', at: '2026-09-20T04:30:00Z', passengerIds: members.map((m) => m.id) }];
  data.transfers = ['guest-met', 'completed', 'requested', 'planned', 'assigned', 'dispatched'].map((state, i) => ({ id: `t${i}`, partyId, legId, kind: direction === 'arrival' ? 'pickup' : 'drop', state, vehicleId: 'car', planBasedOn: data.legs[0].at }));
  data.vehicles = [{ id: 'car', eventId, label: 'Sample car', seats: 50, driver: 'Sample driver' }];
  const originalLeg = structuredClone(data.legs[0]); const history = structuredClone(data.transfers.slice(0, 2));
  const storage = store({ anchor: '2026-09-18', fixtures, receipts: {}, rowReceipts: {}, importParties: {}, seq: 1 });
  let a = createRsvpAdapter({ now, storage }); const v = (await a.loadInvitation(token)).value;
  const answers = { responses: Object.fromEntries(v.members.map((m) => [m.id, m.responses])), arrival: null, departure: null, pickup: false, drop: false, stay: 'needed', dietary: {}, accessibility: {} };
  check((await a.submitInvitation(token, newRequestId(), v.party.version, answers)).ok, 'clear succeeds');
  a = createRsvpAdapter({ now, storage });
  check((await a.loadInvitation(token)).value[direction] === null, 'current details remain null after reload');
  let current = await read(a);
  check(same(current.legs.find((l) => l.id === legId), originalLeg), 'historical leg unchanged');
  check(same(current.transfers.slice(0, 2), history), 'historical vehicle/state/plan unchanged');
  check(current.transfers.every((t) => !t.legId || current.legs.some((l) => l.id === t.legId)), 'no dangling references');
  const manifests = buildManifests(current);
  check(history.every((t) => manifests.some((m) => m.transfers.some((x) => x.id === t.id))), 'historical manifests survive');
  check(!buildManifests(current, false).some((m) => m.transfers.some((t) => t.state === 'completed')), 'allocation guards exclude completed history');
  for (const t of current.transfers.slice(2)) {
    check(t.legId === null && t.vehicleId === null && t.planBasedOn === null, 'active dependency released');
    for (const cmd of [{ type: 'transfer', transferId: t.id, state: 'dispatched' }, { type: 'assign-vehicle', transferIds: [t.id], vehicleId: 'car' }]) check(!(await a.mutate('tnp-manager', eventId, newRequestId(), { ...cmd, baseVersion: current.dataRevision })).ok, 'future dispatch/assignment blocked');
  }
  check(!(await a.mutate('tnp-manager', eventId, newRequestId(), { type: 'change-leg', legId, baseVersion: current.parties.find((p) => p.id === partyId).version, at: null, reference: '' })).ok, 'historical edit blocked');
  const latest = (await a.loadInvitation(token)).value; answers[direction] = v[direction]; answers.pickup = direction === 'arrival'; answers.drop = direction === 'departure';
  check((await a.submitInvitation(token, newRequestId(), latest.party.version, answers)).ok, 'restore details');
  current = await read(a);
  check(current.legs.length === 2 && new Set(current.legs.map((l) => l.id)).size === 2, 'new current leg has distinct identity');
  check(current.transfers.slice(2).every((t) => t.legId && t.legId !== legId && t.vehicleId === null && t.planBasedOn === null), 'future dependencies reconnect only to new unplanned leg');
  check(same(current.legs.find((l) => l.id === legId), originalLeg) && same(current.transfers.slice(0, 2), history), 'restoring details cannot overwrite history');
  check(current.transfers.every((t) => !t.legId || current.legs.some((l) => l.id === t.legId)), 'restoration has no dangling references');
  return true;
}

export async function completedGuardIsolation() {
  const fixtures = createFixtures('2026-09-18'); const d = fixtures.events[eventId];
  const members = d.members.slice(0, 2);
  members.forEach((m) => { m.responses = Object.fromEntries(m.invitedFunctionIds.map((id) => [id, 'confirmed'])); });
  d.vehicles = [{ id: 'car', eventId, label: 'Sample car', seats: 2, driver: 'Sample driver' }];
  d.legs = [0, 1].map((i) => ({ ...d.legs[0], id: `guard-leg-${i}`, partyId: members[i].partyId, direction: 'arrival', from: `Terminal ${i}`, to: 'Hotel', mode: 'flight', at: '2026-09-20T04:30:00Z', passengerIds: [members[i].id] }));
  d.transfers = d.legs.map((l, i) => ({ id: `guard-${i}`, partyId: l.partyId, legId: l.id, kind: 'pickup', state: i ? 'planned' : 'completed', vehicleId: i ? null : 'car', planBasedOn: l.at }));
  const a = createRsvpAdapter({ now, storage: store({ anchor: '2026-09-18', fixtures, receipts: {}, rowReceipts: {}, importParties: {}, seq: 1 }) });
  let current = await read(a);
  check((await a.mutate('tnp-manager', eventId, newRequestId(), { type: 'assign-vehicle', transferIds: ['guard-1'], vehicleId: 'car', baseVersion: current.dataRevision })).ok, 'completed different route does not block assignment');
  current = await read(a);
  check((await a.mutate('tnp-manager', eventId, newRequestId(), { type: 'transfer', transferId: 'guard-1', state: 'dispatched', baseVersion: current.dataRevision })).ok, 'completed different route does not block dispatch');
  check(buildManifests(await read(a)).some((m) => m.transfers.some((t) => t.id === 'guard-0')), 'completed route remains displayed');
  return true;
}
