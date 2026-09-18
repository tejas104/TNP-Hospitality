import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.RSVP_PLAYWRIGHT_MODULE).href);
const browser = await chromium.launch({ executablePath: process.env.RSVP_CHROME, headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const origin = process.env.RSVP_ORIGIN ?? 'http://127.0.0.1:3107';
page.setDefaultTimeout(15000);
try {
  await page.goto(`${origin}/rsvp/login`);
  await page.waitForFunction(() => sessionStorage.getItem('tnp-preloader-seen') === 'true');
  await page.getByRole('button', { name: 'Sample TNP service manager', exact: false }).click();
  await page.waitForFunction(() => sessionStorage.getItem('tnp-rsvp-preview-persona') === 'tnp-manager');
  const result = await page.evaluate(async () => {
    const { createRsvpAdapter, newRequestId } = await import('/components/tnp/portals/rsvp/adapter.ts');
    const { previewImport } = await import('/components/tnp/portals/rsvp/importer.ts');
    const { createFixtures } = await import('/components/tnp/portals/rsvp/fixtures.ts');
    const a = createRsvpAdapter(); const eventId = 'evt-mehra-udaipur';
    const data = (await a.loadEvent('tnp-manager', eventId)).value;
    const csv = 'guest_ref,party_name,member_name,phone,functions\nBROWSER-R3,Sample family,Sample guest,+915550123456,all';
    const rows = previewImport(csv, null, data).rows;
    await a.applyImport('tnp-manager', eventId, 'accepted', rows);
    const before = JSON.stringify((await a.loadEvent('tnp-manager', eventId)).value);
    const moved = await a.applyImport('tnp-manager', eventId, 'accepted', [{ ...rows[0], rowNumber: 8 }]);
    const unchanged = before === JSON.stringify((await a.loadEvent('tnp-manager', eventId)).value);
    const rejected = previewImport(csv.replace('+915550123456', '12'), null, data).rows;
    await a.applyImport('tnp-manager', eventId, 'rejected', rejected);
    const replay = await a.applyImport('tnp-manager', eventId, 'rejected', rejected);
    const changed = structuredClone(rejected); changed[0].values.phone = '+915550999999';
    const conflict = await a.applyImport('tnp-manager', eventId, 'rejected', changed);

    const { localDate } = await import('/components/tnp/portals/rsvp/dates.ts');
    const anchor = localDate(Date.now(), 'Asia/Kolkata'); const fixtures = createFixtures(anchor);
    const d = fixtures.events[eventId]; const partyId = fixtures.invitations['mrw-guest-0101'].partyId;
    const members = d.members.filter((m) => m.partyId === partyId);
    members.forEach((m) => { m.responses = Object.fromEntries(m.invitedFunctionIds.map((id) => [id, 'confirmed'])); });
    d.legs = [{ ...d.legs[0], id: 'browser-leg', partyId, direction: 'arrival', mode: 'flight', reference: 'SAMPLE', from: 'Terminal 1', to: 'Lake Hotel', at: `${anchor}T04:30:00Z`, passengerIds: members.map((m) => m.id) }];
    d.vehicles = [{ id: 'car', eventId, label: 'Sample car', seats: 20, driver: 'Sample driver' }];
    d.transfers = [{ id: 'browser-transfer', partyId, legId: 'browser-leg', kind: 'pickup', state: 'assigned', vehicleId: 'car', planBasedOn: d.legs[0].at }];
    sessionStorage.setItem('tnp-rsvp-synthetic-v1', JSON.stringify({ anchor, fixtures, receipts: {}, rowReceipts: {}, importParties: {}, seq: 100 }));
    const travel = createRsvpAdapter({ storage: sessionStorage });
    const v = (await travel.loadInvitation('mrw-guest-0101')).value;
    const answers = { responses: Object.fromEntries(v.members.map((m) => [m.id, m.responses])), arrival: { ...v.arrival, from: '  Terminal   2  ' }, departure: { mode: 'unknown', at: null, reference: '', to: '' }, pickup: true, drop: false, stay: 'needed', dietary: {}, accessibility: {} };
    const submitted = await travel.submitInvitation('mrw-guest-0101', newRequestId(), v.party.version, answers);
    const after = (await travel.loadEvent('tnp-manager', eventId)).value;
    const t = after.transfers.find((t) => t.id === 'browser-transfer');
    const dispatch = await travel.mutate('tnp-manager', eventId, newRequestId(), { type: 'transfer', transferId: t.id, state: 'dispatched', baseVersion: after.dataRevision });
    return { moved: moved.error.code, unchanged, replay: replay.value[0], conflict: conflict.error.code, submitted: submitted.ok, from: after.legs[0].from, transfer: t, dispatch: dispatch.ok };
  });
  assert.equal(result.moved, 'conflict'); assert.equal(result.unchanged, true);
  assert.equal(result.replay.result, 'rejected'); assert.equal(result.replay.replayed, true); assert.equal(result.conflict, 'conflict');
  assert.equal(result.submitted, true); assert.equal(result.from, 'Terminal 2');
  assert.equal(result.transfer.vehicleId, null); assert.equal(result.transfer.planBasedOn, null); assert.equal(result.dispatch, false);
  console.log('Browser-loaded adapter: moved accepted identity, rejected replay/material conflict, normalized endpoint and atomic plan release: PASS');
  await page.goto(`${origin}/rsvp/events/evt-mehra-udaipur?view=movements`);
  await page.getByRole('heading', { name: 'Terminal 2 → Lake Hotel (flight)', exact: true }).waitFor();
  await page.getByText(/Changed travel affects 1 planned movement/).waitFor();
  await page.getByRole('button', { name: 'Replan against new times', exact: true }).click();
  await page.waitForFunction(() => {
    const d = JSON.parse(sessionStorage.getItem('tnp-rsvp-synthetic-v1')).fixtures.events['evt-mehra-udaipur'];
    return d.transfers.find((t) => t.id === 'browser-transfer').planBasedOn === d.legs[0].at;
  });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
  assert.deepEqual(errors, []);
  console.log('390px persisted endpoint rendering, changed-plan warning, actual Replan action, no overflow/page errors: PASS');
} finally {
  await browser.close();
}
