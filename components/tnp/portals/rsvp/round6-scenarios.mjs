import { createRsvpAdapter, fingerprint, newRequestId } from './adapter.ts';
import { createFixtures } from './fixtures.ts';
import { buildManifests } from './logic.ts';
const check = (value, message) => { if (!value) throw new Error(message); };
const eventId = 'evt-mehra-udaipur'; const token = 'mrw-guest-0101';
const now = () => Date.parse('2026-09-18T04:30:00Z');
function setup(kind, states) {
  const fixtures = createFixtures('2026-09-18'); const d = fixtures.events[eventId]; const partyId = fixtures.invitations[token].partyId;
  const members = d.members.filter((m) => m.partyId === partyId);
  members.forEach((m) => { m.responses = Object.fromEntries(m.invitedFunctionIds.map((id) => [id, 'confirmed'])); });
  const direction = kind === 'pickup' ? 'arrival' : 'departure';
  d.legs = [{ ...d.legs[0], id: 'initial-leg', partyId, direction, mode: 'flight', reference: 'SAMPLE', from: 'Terminal 1', to: 'Hotel', at: '2026-09-20T04:30:00Z', passengerIds: members.map((m) => m.id) }];
  d.vehicles = [{ id: 'car', eventId, label: 'Sample car', seats: 50, driver: 'Sample driver' }];
  d.transfers = states.map((state, i) => ({ id: `${partyId}-${kind}${i ? `-${i + 1}` : ''}`, partyId, legId: 'initial-leg', kind, state, vehicleId: 'car', planBasedOn: d.legs[0].at }));
  let saved = JSON.stringify({ anchor: '2026-09-18', fixtures, receipts: {}, rowReceipts: {}, importParties: {}, seq: 1 });
  const storage = { getItem: () => saved, setItem: (_k, v) => { saved = v; }, removeItem: () => {} };
  return { storage, direction, make: () => createRsvpAdapter({ now, storage }) };
}
const read = async (a) => (await a.loadEvent('tnp-manager', eventId)).value;
const answersFor = (v) => ({ responses: Object.fromEntries(v.members.map((m) => [m.id, m.responses])), arrival: v.arrival, departure: v.departure, pickup: v.pickup, drop: v.drop, stay: 'needed', dietary: {}, accessibility: {} });
export async function restoredIdentity(kind) {
  const env = setup(kind, ['guest-met', 'completed']); let a = env.make();
  const original = await read(a); const initial = (await a.loadInvitation(token)).value;
  const details = initial[env.direction]; const history = original.transfers;
  check(initial[kind] === false, 'historical-only intent false');
  const generated = new Set();
  for (let cycle = 0; cycle < 3; cycle++) {
    let v = (await a.loadInvitation(token)).value;
    const clear = { ...answersFor(v), [env.direction]: null, [kind]: false };
    check((await a.submitInvitation(token, newRequestId(), v.party.version, clear)).ok, 'clear succeeds');
    a = env.make(); v = (await a.loadInvitation(token)).value;
    check(v[kind] === false, 'clear reload false');
    check((await a.submitInvitation(token, newRequestId(), v.party.version, answersFor(v))).ok, 'unchanged false revise succeeds');
    check((await a.loadInvitation(token)).value[kind] === false, 'unchanged false cannot resurrect');
    v = (await a.loadInvitation(token)).value;
    const restored = { ...answersFor(v), [env.direction]: { ...details, at: `2026-09-${21 + cycle}T04:30:00Z` }, [kind]: true };
    const request = newRequestId();
    const first = await a.submitInvitation(token, request, v.party.version, restored);
    check(first.ok, 'restore succeeds'); const beforeReplay = await read(a);
    check((await a.submitInvitation(token, request, v.party.version, restored)).replayed, 'exact submission replays');
    check(fingerprint(await read(a)) === fingerprint(beforeReplay), 'replay cannot allocate another ID');
    const active = beforeReplay.transfers.find((t) => t.state === 'requested');
    check(active && !generated.has(active.id) && !history.some((t) => t.id === active.id), 'fresh unique active ID'); generated.add(active.id);
    check(new Set(beforeReplay.transfers.map((t) => t.id)).size === beforeReplay.transfers.length, 'all IDs unique');
    for (const state of ['planned', 'assigned', 'dispatched', 'guest-met', 'completed']) {
      const current = await read(a);
      const cmd = state === 'assigned' ? { type: 'assign-vehicle', transferIds: [active.id], vehicleId: 'car' } : { type: 'transfer', transferId: active.id, state };
      check((await a.mutate('tnp-manager', eventId, newRequestId(), { ...cmd, baseVersion: current.dataRevision })).ok, `active ID mutation ${state}`);
      check((await read(a)).transfers.find((t) => t.id === active.id).state === state, 'ID targets active record');
    }
    check(fingerprint((await read(a)).transfers.slice(0, 2)) === fingerprint(history), 'initial history immutable');
  }
  const final = await read(a);
  check(history.every((t) => buildManifests(final).some((m) => m.transfers.some((x) => x.id === t.id))), 'history remains visible');
  return true;
}
export async function intentProjection(kind) {
  for (const state of ['requested', 'awaiting-details', 'planned', 'assigned', 'dispatched', 'guest-met', 'completed', 'cancelled', 'not-required']) {
    const env = setup(kind, [state]); const a = env.make();
    const active = ['requested', 'awaiting-details', 'planned', 'assigned', 'dispatched'].includes(state);
    check((await a.loadInvitation(token)).value[kind] === active, `${state} projection`);
  }
  const env = setup(kind, ['guest-met', 'completed', 'assigned']); let a = env.make();
  const v = (await a.loadInvitation(token)).value;
  check(v[kind] === true, 'active request with history true');
  check((await a.submitInvitation(token, newRequestId(), v.party.version, { ...answersFor(v), [kind]: false })).ok, 'turn off active request');
  a = env.make(); const after = (await a.loadInvitation(token)).value;
  check(after[kind] === false, 'cancelled plus history false on reload');
  const before = (await read(a)).transfers;
  check((await a.submitInvitation(token, newRequestId(), after.party.version, answersFor(after))).ok, 'unchanged projected false revise');
  check(fingerprint((await read(a)).transfers) === fingerprint(before), 'no cancelled resurrection or historical mutation');
  return true;
}
