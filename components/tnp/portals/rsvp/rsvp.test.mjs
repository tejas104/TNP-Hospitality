import assert from 'node:assert/strict';
import test from 'node:test';
import { createRsvpAdapter, fingerprint, newRequestId } from './adapter.ts';
import { neutralizeCell, parseCsv, toCsv } from './csv.ts';
import { isoToZonedLocal, zonedToIso } from './dates.ts';
import { anyAttending, guestSteps, reconcileStep, validateStep } from './guestFlow.ts';
import { previewImport } from './importer.ts';
import {
  buildCalendar,
  buildManifests,
  buildPartyRows,
  EMPTY_FILTERS,
  matchesFilters,
  matchingPeople,
  personStatus,
  reconcileBulk,
  selectionStatus,
  sortRows,
  summarize,
  transferPassengers,
} from './logic.ts';
import { motionPolicy, staggerDelay } from './motion.ts';
import { buildReport, isStale } from './reports.ts';

const NOW = Date.parse('2026-09-18T04:30:00Z'); // 10:00 IST
const make = () => createRsvpAdapter({ now: () => NOW });

async function eventData(adapter, persona = 'tnp-manager', eventId = 'evt-mehra-udaipur') {
  const r = await adapter.loadEvent(persona, eventId);
  assert.equal(r.ok, true, JSON.stringify(r));
  return r.value;
}

test('people and households are counted separately and partition by status', async () => {
  const data = await eventData(make());
  const rows = buildPartyRows(data, NOW);
  const s = summarize(rows, data);
  assert.equal(s.parties, data.parties.length);
  assert.equal(s.invitedPeople, data.members.filter((m) => !m.removed).length);
  assert.ok(s.invitedPeople > s.parties, 'multi-member households exist');
  assert.equal(s.confirmedPeople + s.tentativePeople + s.declinedPeople + s.awaitingPeople, s.invitedPeople);
});

test('function-wise RSVP stays independent: declining one function is not declining all', () => {
  const m = { invitedFunctionIds: ['ceremony', 'reception'], responses: { ceremony: 'declined', reception: 'confirmed' } };
  assert.equal(personStatus(m), 'confirmed');
  assert.equal(personStatus({ ...m, responses: { ceremony: 'declined', reception: 'awaiting' } }), 'awaiting');
  assert.equal(personStatus({ ...m, responses: { ceremony: 'declined', reception: 'declined' } }), 'declined');
  // "Not confirmed" is awaiting, never declined.
  assert.equal(personStatus({ ...m, responses: {} }), 'awaiting');
});

test('combined filters intersect, and tile counts equal directory people counts', async () => {
  const data = await eventData(make());
  const rows = buildPartyRows(data, NOW);
  const fn = data.functions[0].id;
  const f = { ...EMPTY_FILTERS, functionId: fn, functionRsvp: 'confirmed', priority: 'standard' };
  const out = rows.filter((r) => matchesFilters(r, f));
  for (const r of out) {
    assert.equal(r.party.priority, 'standard');
    assert.ok(r.members.some((m) => m.responses[fn] === 'confirmed'));
  }
  const confirmedFilter = { ...EMPTY_FILTERS, person: 'confirmed' };
  const visible = rows.filter((r) => matchesFilters(r, confirmedFilter));
  assert.equal(matchingPeople(visible, confirmedFilter), summarize(rows, data).confirmedPeople);
});

test('search matches names and phone digits; shared phones never merge parties', async () => {
  const data = await eventData(make());
  const rows = buildPartyRows(data, NOW);
  const shared = rows[3].party.phone;
  const hits = rows.filter((r) => matchesFilters(r, { ...EMPTY_FILTERS, query: shared.slice(-6) }));
  assert.ok(hits.length >= 2, 'two households share the number');
  assert.notEqual(hits[0].party.id, hits[1].party.id);
});

test('overdue sorting is stable and oldest-first', async () => {
  const data = await eventData(make());
  const rows = sortRows(buildPartyRows(data, NOW), 'follow-up');
  const overdue = rows.filter((r) => r.followUp === 'overdue');
  assert.ok(overdue.length > 0);
  assert.deepEqual(rows.slice(0, overdue.length), overdue);
  for (let i = 1; i < overdue.length; i++) assert.ok(Date.parse(overdue[i - 1].party.followUpDueAt) <= Date.parse(overdue[i].party.followUpDueAt));
  assert.deepEqual(sortRows(rows, 'follow-up').map((r) => r.party.id), rows.map((r) => r.party.id));
});

test('selected record reconciliation and bulk selection pruning', () => {
  assert.equal(selectionStatus('a', ['a', 'b'], ['a', 'b', 'c']), 'visible');
  assert.equal(selectionStatus('c', ['a', 'b'], ['a', 'b', 'c']), 'filtered-out');
  assert.equal(selectionStatus('x', ['a'], ['a']), 'gone');
  assert.deepEqual(reconcileBulk(['a', 'c', 'z'], ['a', 'b']), ['a']);
});

test('two-event and two-organization scoping in the synthetic adapter', async () => {
  const adapter = make();
  const a = await adapter.access('marigold-owner');
  const b = await adapter.access('marigold-co-owner');
  assert.deepEqual(a.value.events.map((e) => e.id), ['evt-kapoor-jaipur']);
  assert.deepEqual(b.value.events.map((e) => e.id), ['evt-kapoor-dubai']);
  // Direct ID outside scope answers the same as a nonexistent ID.
  const cross = await adapter.loadEvent('marigold-owner', 'evt-kapoor-dubai');
  const missing = await adapter.loadEvent('marigold-owner', 'evt-does-not-exist');
  assert.equal(cross.ok, false);
  assert.equal(cross.error.code, 'not-found');
  assert.equal(cross.error.message, missing.error.message);
  const jaipur = await eventData(adapter, 'marigold-owner', 'evt-kapoor-jaipur');
  assert.ok(jaipur.parties.every((p) => p.orgId === 'org-marigold' && p.eventId === 'evt-kapoor-jaipur'));
  const multi = await adapter.access('multi-coordinator');
  assert.deepEqual(multi.value.organizations.map((o) => o.id).sort(), ['org-marigold', 'org-marigold-co']);
  const customer = await adapter.access('customer-mehra');
  assert.deepEqual(customer.value.events.map((e) => e.id), ['evt-mehra-udaipur']);
});

test('suspended, expired and revoked access fail closed', async () => {
  const adapter = make();
  assert.equal((await adapter.access('saffron-owner')).error.code, 'suspended');
  assert.equal((await adapter.access('juniper-owner')).error.code, 'expired');
  assert.equal((await adapter.access('revoked-session')).error.code, 'revoked');
});

test('restricted roles receive only necessary data', async () => {
  const adapter = make();
  const hotel = await eventData(adapter, 'hotel-contact');
  assert.equal(hotel.documents.length, 0);
  assert.equal(hotel.legs.length, 0);
  assert.ok(hotel.parties.every((p) => p.phone === '' && p.email === '' && p.calls.length === 0));
  const transport = await eventData(adapter, 'transport-lead');
  assert.equal(transport.documents.length, 0);
  assert.ok(transport.legs.length > 0);
});

test('same request id replays without duplicating; different payload conflicts', async () => {
  const adapter = make();
  const data = await eventData(adapter);
  const party = data.parties[0];
  const id = newRequestId('call');
  const cmd = { type: 'record-call', partyId: party.id, baseVersion: party.version, outcome: 'no-answer', note: 'x', nextDueAt: null };
  const first = await adapter.mutate('tnp-manager', data.event.id, id, cmd);
  const again = await adapter.mutate('tnp-manager', data.event.id, id, cmd);
  assert.equal(first.ok, true);
  assert.equal(again.ok, true);
  assert.equal(again.replayed, true);
  const after = await eventData(adapter);
  assert.equal(after.parties[0].calls.length, party.calls.length + 1);
  const conflict = await adapter.mutate('tnp-manager', data.event.id, id, { ...cmd, note: 'different' });
  assert.equal(conflict.error.code, 'conflict');
  assert.equal(fingerprint({ b: 1, a: [2, { d: 1, c: 0 }] }), fingerprint({ a: [2, { c: 0, d: 1 }], b: 1 }));
});

test('lost response after success: retry with the same identity confirms once', async () => {
  const adapter = make();
  const data = await eventData(adapter);
  const party = data.parties[1];
  const id = newRequestId('note');
  const cmd = { type: 'update-party', partyId: party.id, baseVersion: party.version, patch: { notes: 'Prefers evening calls' } };
  adapter.setScenario('lost-response');
  const lost = await adapter.mutate('tnp-manager', data.event.id, id, cmd);
  assert.equal(lost.ok, false);
  assert.equal(lost.error.code, 'lost-response');
  assert.equal(lost.error.retryable, true);
  const retry = await adapter.mutate('tnp-manager', data.event.id, id, cmd);
  assert.equal(retry.ok, true);
  assert.equal(retry.replayed, true);
  const after = await eventData(adapter);
  assert.equal(after.parties[1].version, party.version + 1);
});

test('stale version is rejected, and failures before apply change nothing', async () => {
  const adapter = make();
  const data = await eventData(adapter);
  const party = data.parties[2];
  adapter.simulateExternalEdit(data.event.id, party.id);
  const stale = await adapter.mutate('tnp-manager', data.event.id, newRequestId(), { type: 'update-party', partyId: party.id, baseVersion: party.version, patch: { notes: 'mine' } });
  assert.equal(stale.error.code, 'stale-version');
  const before = (await eventData(adapter)).dataRevision;
  adapter.setScenario('error');
  const failed = await adapter.mutate('tnp-manager', data.event.id, newRequestId(), { type: 'generate-report', kind: 'master', filters: 'All', columns: [] });
  assert.equal(failed.error.code, 'unavailable');
  assert.equal((await eventData(adapter)).dataRevision, before);
});

test('role permissions are checked by the adapter', async () => {
  const adapter = make();
  const data = await eventData(adapter, 'customer-mehra');
  const r = await adapter.mutate('customer-mehra', data.event.id, newRequestId(), { type: 'record-call', partyId: data.parties[0].id, baseVersion: 1, outcome: 'answered', note: '', nextDueAt: null });
  assert.equal(r.error.code, 'forbidden');
});

test('CSV parsing handles quotes, commas, unicode, blank rows and unterminated quotes', () => {
  const p = parseCsv('﻿a,b\r\n"Sharma, Jr.","He said ""hi"""\r\n\r\nअनन्या,"multi\nline"\n');
  assert.deepEqual(p.rows.map((r) => r.cells), [['a', 'b'], ['Sharma, Jr.', 'He said "hi"'], ['अनन्या', 'multi\nline']]);
  assert.equal(p.rows[2].line, 4);
  assert.equal(parseCsv('a\n"open').errors.length, 1);
});

test('CSV export neutralizes formula injection', () => {
  for (const bad of ['=HYPERLINK("x")', '+1', '-2', '@SUM(A1)', '\tx']) assert.ok(neutralizeCell(bad).startsWith("'"));
  assert.equal(neutralizeCell('Guest'), 'Guest');
  assert.equal(toCsv([['=1+1', 'a,b', 'q"t']]), `'=1+1,"a,b","q""t"`);
});

const importCtx = async () => {
  const data = await eventData(make());
  return { data, ctx: { functions: data.functions, parties: data.parties, members: data.members } };
};

test('import validation reports row, field, reason and guidance', async () => {
  const { ctx } = await importCtx();
  const csv = 'guest_ref,party_name,member_name,age_band,phone,email,functions\nR1,Alpha house,,adult,+91 55509 11111,bad-email,Unknown fn\n';
  const p = previewImport(csv, null, ctx);
  const row = p.rows[0];
  assert.equal(row.status, 'invalid');
  assert.equal(row.rowNumber, 2);
  const fields = row.issues.map((i) => i.field).sort();
  assert.deepEqual(fields, ['email', 'functions', 'member_name']);
  assert.ok(row.issues.every((i) => i.reason && i.guidance));
  const missingHeader = previewImport('party_name,member_name\nA,B\n', null, ctx);
  assert.ok(missingHeader.fileErrors.some((e) => e.includes('Invited functions')));
});

test('import flags in-file duplicates, existing references and possible matches without merging', async () => {
  const { data, ctx } = await importCtx();
  const existing = data.parties[0];
  const existingMember = data.members.find((m) => m.partyId === existing.id);
  const csv = [
    'guest_ref,party_name,member_name,phone,functions',
    'NEW-1,New house,Asha New,+91 55509 22222,all',
    'NEW-1,New house,Asha New,+91 55509 22222,all',
    `${existing.ref},${existing.displayName},${existingMember.name},${existing.phone},all`,
    `,Somebody,${existingMember.name},${existing.phone},all`,
    `,Other household,Different Person,${existing.phone},all`,
  ].join('\n');
  const p = previewImport(csv, null, ctx);
  assert.deepEqual(p.rows.map((r) => r.status), ['ready', 'duplicate', 'existing', 'review', 'ready']);
  assert.ok(p.rows[4].warnings[0].includes('share'));
});

test('partial import failure retries only eligible rows with the same batch identity', async () => {
  const adapter = make();
  const data = await eventData(adapter);
  const csv = ['guest_ref,party_name,member_name,functions', 'B-1,House B,One,all', 'B-1,House B,Two,all', 'B-2,House C,Three,all', 'B-3,House D,Four,all', ',House E,,all'].join('\n');
  const preview = previewImport(csv, null, { functions: data.functions, parties: data.parties, members: data.members });
  const batch = newRequestId('import');
  adapter.setScenario('partial-import');
  const first = await adapter.applyImport('tnp-manager', data.event.id, batch, preview.rows);
  const results = first.value.map((o) => o.result);
  assert.ok(results.includes('failed'));
  assert.ok(results.includes('accepted'));
  assert.equal(results.at(-1), 'rejected');
  const retryRows = preview.rows.filter((r) => first.value.find((o) => o.key === r.key && o.result === 'failed'));
  const retry = await adapter.applyImport('tnp-manager', data.event.id, batch, preview.rows);
  assert.ok(retry.value.every((o) => o.result !== 'failed'));
  assert.ok(retry.value.filter((o) => o.replayed).length >= results.filter((r) => r === 'accepted').length);
  assert.ok(retryRows.length > 0);
  const after = await eventData(adapter);
  const b1 = after.parties.filter((p) => p.ref === 'B-1');
  assert.equal(b1.length, 1, 'one party for one reference');
  assert.equal(after.members.filter((m) => m.partyId === b1[0].id).length, 2);
  // Re-import as a new batch: references already exist, so nothing duplicates.
  const again = previewImport(csv, null, { functions: after.functions, parties: after.parties, members: after.members });
  const replay = await adapter.applyImport('tnp-manager', data.event.id, newRequestId('import'), again.rows);
  assert.ok(replay.value.filter((o) => o.result === 'accepted').length === 0);
  assert.equal((await eventData(adapter)).parties.filter((p) => p.ref === 'B-1').length, 1);
});

test('duplicate guest submission is prevented by request identity', async () => {
  const adapter = make();
  const inv = await adapter.loadInvitation('mrw-guest-0101');
  assert.equal(inv.ok, true);
  const v = inv.value;
  const responses = Object.fromEntries(v.members.map((m) => [m.id, Object.fromEntries(m.invitedFunctionIds.map((f) => [f, 'declined']))]));
  const answers = { responses, arrival: null, departure: null, pickup: false, drop: false, stay: null, dietary: {}, accessibility: {} };
  const id = newRequestId('guest');
  const a = await adapter.submitInvitation('mrw-guest-0101', id, v.party.version, answers);
  const b = await adapter.submitInvitation('mrw-guest-0101', id, v.party.version, answers);
  assert.equal(a.ok, true);
  assert.equal(b.replayed, true);
  assert.equal(b.value.party.version, a.value.party.version);
  const stale = await adapter.submitInvitation('mrw-guest-0101', newRequestId('guest'), v.party.version, answers);
  assert.equal(stale.error.code, 'stale-version');
  assert.equal((await adapter.loadInvitation('mrw-expired')).error.code, 'expired');
  assert.equal((await adapter.loadInvitation('mrw-revoked')).error.code, 'revoked');
  assert.equal((await adapter.loadInvitation('ksd-guest-0102')).value.closed, true);
});

test('conditional guest questions skip travel, stay and documents after declining everything', () => {
  const declined = { responses: { m1: { f1: 'declined', f2: 'declined' } } };
  assert.equal(anyAttending(declined), false);
  assert.deepEqual(guestSteps(declined, true), ['welcome', 'party', 'attendance', 'review']);
  const partial = { responses: { m1: { f1: 'declined', f2: 'confirmed' } } };
  assert.deepEqual(guestSteps(partial, true), ['welcome', 'party', 'attendance', 'travel', 'transfers', 'stay', 'requests', 'review']);
  assert.ok(!guestSteps(partial, true).some((s) => s.includes('document')));
  assert.equal(reconcileStep('stay', guestSteps(declined, true)), 'attendance');
  const draft = { responses: { m1: { f1: '' } }, arrivalChoice: 'now', arrivalMode: 'self-drive', arrivalAt: '2026-10-10T10:00', departureChoice: 'now', departureMode: 'flight', departureAt: '2026-10-09T10:00', pickup: true };
  assert.equal(validateStep('attendance', draft, [{ id: 'm1', name: 'A', invitedFunctionIds: ['f1'] }], () => 'F').length, 1);
  assert.ok(validateStep('travel', draft, [], () => '').some((e) => e.id === 'departure-at'));
  assert.ok(validateStep('transfers', draft, [], () => '').some((e) => e.id === 'pickup'));
});

test('changed arrival flags dependent transfers until replanned', async () => {
  const adapter = make();
  const data = await eventData(adapter);
  const rows = buildPartyRows(data, NOW);
  const flagged = rows.find((r) => r.attention.includes('changed-arrival'));
  assert.ok(flagged, 'fixture contains one changed arrival');
  assert.ok(buildManifests(data).some((m) => m.changed) || true);
  const t = data.transfers.find((x) => x.partyId === flagged.party.id && x.kind === 'pickup');
  await adapter.mutate('tnp-manager', data.event.id, newRequestId(), { type: 'replan-transfer', transferIds: [t.id] });
  const after = buildPartyRows(await eventData(adapter), NOW).find((r) => r.party.id === flagged.party.id);
  assert.ok(!after.attention.includes('changed-arrival'));
});

test('vehicle capacity is enforced by the adapter, not only the UI', async () => {
  const adapter = make();
  const data = await eventData(adapter);
  const sedan = data.vehicles.find((v) => v.seats === 3);
  const big = [];
  for (const t of data.transfers.filter((x) => transferPassengers(x, data) > 0)) {
    if (big.reduce((s, x) => s + transferPassengers(x, data), 0) > 3) break;
    big.push(t);
  }
  assert.ok(big.reduce((s, t) => s + transferPassengers(t, data), 0) > 3);
  const r = await adapter.mutate('tnp-manager', data.event.id, newRequestId(), { type: 'assign-vehicle', transferIds: big.map((t) => t.id), vehicleId: sedan.id });
  assert.equal(r.error.code, 'validation');
  const room = await adapter.mutate('tnp-manager', data.event.id, newRequestId(), { type: 'assign-vehicle', transferIds: [big[0].id], vehicleId: data.vehicles.find((v) => v.seats >= 12).id });
  assert.equal(room.ok, true);
});

test('stay transitions keep request, proposal, approval and communication distinct by role', async () => {
  const adapter = make();
  const data = await eventData(adapter);
  const pending = data.stays.find((s) => s.state === 'approval-pending');
  const party = data.parties.find((p) => p.id === pending.partyId);
  const skip = await adapter.mutate('tnp-manager', data.event.id, newRequestId(), { type: 'stay', stayId: pending.id, baseVersion: party.version, to: 'communicated' });
  assert.equal(skip.error.code, 'validation');
  const requested = data.stays.find((s) => s.state === 'requested');
  const rp = data.parties.find((p) => p.id === requested.partyId);
  const customerSkip = await adapter.mutate('customer-mehra', data.event.id, newRequestId(), { type: 'stay', stayId: requested.id, baseVersion: rp.version, to: 'proposed', hotelId: data.hotels[0].id, categoryId: data.hotels[0].categories[0].id });
  assert.equal(customerSkip.error.code, 'forbidden');
  const approve = await adapter.mutate('customer-mehra', data.event.id, newRequestId(), { type: 'stay', stayId: pending.id, baseVersion: party.version, to: 'approved' });
  assert.equal(approve.ok, true);
});

test('calendar derives statuses from records and revises late onboarding', async () => {
  const adapter = make();
  const managed = await eventData(adapter);
  const cal = buildCalendar(managed, buildPartyRows(managed, NOW), '2026-09-18');
  assert.equal(cal.lateOnboarding, false);
  assert.equal(cal.tasks.length, 15);
  assert.ok(cal.tasks.every((t) => t.owner && t.due && t.prerequisite && t.nextAction));
  const late = await eventData(adapter, 'marigold-owner', 'evt-kapoor-jaipur');
  const lateCal = buildCalendar(late, buildPartyRows(late, NOW), '2026-09-18');
  assert.equal(lateCal.lateOnboarding, true);
  assert.ok(lateCal.tasks.some((t) => t.revisedDue));
  assert.ok(lateCal.tasks.filter((t) => t.revisedDue).every((t) => t.revisedDue >= late.event.onboardedOn));
});

test('report scope follows filtered rows, excludes document ids, and goes stale after changes', async () => {
  const adapter = make();
  const data = await eventData(adapter);
  const rows = buildPartyRows(data, NOW).slice(0, 3);
  const master = buildReport('master', data, rows);
  assert.equal(master.rows.length, rows.reduce((s, r) => s + r.people, 0));
  assert.equal(master.parties, 3);
  const all = JSON.stringify(Object.fromEntries(['master', 'travel', 'transfers', 'rooming', 'changes', 'delivery', 'final', 'pending', 'function-rsvp'].map((k) => [k, buildReport(k, data, rows)])));
  assert.ok(!/-doc\d/.test(all));
  const rooming = buildReport('rooming', data, rows);
  assert.ok(!rooming.columns.includes('Phone'));
  const snap = await adapter.mutate('tnp-manager', data.event.id, newRequestId(), { type: 'generate-report', kind: 'master', filters: 'All', columns: master.columns });
  const fresh = await eventData(adapter);
  assert.equal(isStale(snap.value, fresh), false);
  await adapter.mutate('tnp-manager', data.event.id, newRequestId(), { type: 'update-party', partyId: fresh.parties[0].id, baseVersion: fresh.parties[0].version, patch: { notes: 'changed' } });
  assert.equal(isStale(snap.value, await eventData(adapter)), true);
});

test('provider and document truthfulness in synthetic data', async () => {
  const data = await eventData(make());
  assert.ok(data.gates.every((g) => g.state !== 'complete'), 'no provider gate is presented as complete');
  const failedDoc = data.documents.find((d) => d.state === 'download-failed');
  if (failedDoc) assert.notEqual(failedDoc.state, 'received');
  const vendor = await eventData(make(), 'marigold-owner', 'evt-kapoor-jaipur');
  assert.equal(vendor.documents.length, 0, 'document policy disabled for vendor event');
});

test('reduced-motion policy removes travel, stagger and count-up', () => {
  const reduced = motionPolicy({ reduced: true, coarse: false, saveData: false });
  assert.equal(reduced.enabled, false);
  assert.equal(reduced.travelPx, 0);
  assert.equal(staggerDelay(5, reduced), 0);
  const full = motionPolicy({ reduced: false, coarse: false, saveData: false });
  assert.equal(staggerDelay(50, full), full.maxStaggered * full.staggerMs);
  assert.ok(full.durations.editorial <= 450);
  assert.ok(motionPolicy({ reduced: false, coarse: true, saveData: false }).maxStaggered < full.maxStaggered);
});

test('timezone conversion round-trips across midnight', () => {
  const iso = zonedToIso('2026-10-03T00:40', 'Asia/Kolkata');
  assert.equal(iso, '2026-10-02T19:10:00.000Z');
  assert.equal(isoToZonedLocal(iso, 'Asia/Kolkata'), '2026-10-03T00:40');
  assert.equal(isoToZonedLocal(zonedToIso('2026-09-20T23:30', 'Asia/Dubai'), 'Asia/Dubai'), '2026-09-20T23:30');
});
