import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.RSVP_PLAYWRIGHT_MODULE).href);
const browser = await chromium.launch({ executablePath: process.env.RSVP_CHROME, headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const origin = process.env.RSVP_ORIGIN ?? 'http://127.0.0.1:3107';
try {
  await page.goto(`${origin}/rsvp/login`);
  await page.waitForFunction(() => sessionStorage.getItem('tnp-preloader-seen') === 'true');
  await page.getByRole('button', { name: 'Sample TNP service manager', exact: false }).click();
  await page.waitForFunction(() => sessionStorage.getItem('tnp-rsvp-preview-persona') === 'tnp-manager');
  const result = await page.evaluate(async () => {
    const { createRsvpAdapter, newRequestId } = await import('/components/tnp/portals/rsvp/adapter.ts');
    const { previewImport } = await import('/components/tnp/portals/rsvp/importer.ts');
    const { createFixtures } = await import('/components/tnp/portals/rsvp/fixtures.ts');
    const { localDate } = await import('/components/tnp/portals/rsvp/dates.ts');
    const eventId = 'evt-mehra-udaipur'; const a = createRsvpAdapter();
    const d = (await a.loadEvent('tnp-manager', eventId)).value;
    const header = 'party_name,member_name,phone,functions'; const row = 'Sample family,Sample guest,+915550123456,all';
    const rows = previewImport(`${header}\n${row}`, null, d).rows;
    await a.applyImport('tnp-manager', eventId, 'browser-r4', rows);
    const before = JSON.stringify((await a.loadEvent('tnp-manager', eventId)).value);
    const moved = previewImport(`${header}\n\n${row}`, null, d).rows;
    const conflict = await a.applyImport('tnp-manager', eventId, 'browser-r4', moved);
    const unchanged = before === JSON.stringify((await a.loadEvent('tnp-manager', eventId)).value);
    const travelResults = [];
    for (const direction of ['arrival', 'departure']) {
      const anchor = localDate(Date.now(), 'Asia/Kolkata'); const fixtures = createFixtures(anchor);
      const data = fixtures.events[eventId]; const token = 'mrw-guest-0101'; const partyId = fixtures.invitations[token].partyId;
      const members = data.members.filter((m) => m.partyId === partyId);
      members.forEach((m) => { m.responses = Object.fromEntries(m.invitedFunctionIds.map((id) => [id, 'confirmed'])); });
      data.legs = [{ ...data.legs[0], id: 'known', partyId, direction, mode: 'flight', reference: 'SAMPLE', from: 'Terminal 1', to: 'Lake Hotel', at: `${anchor}T04:30:00Z`, passengerIds: members.map((m) => m.id) }];
      data.vehicles = [{ id: 'car', eventId, label: 'Sample car', seats: 20, driver: 'Sample driver' }];
      data.transfers = [{ id: 'known-transfer', partyId, legId: 'known', kind: direction === 'arrival' ? 'pickup' : 'drop', state: 'assigned', vehicleId: 'car', planBasedOn: data.legs[0].at }];
      sessionStorage.setItem('tnp-rsvp-synthetic-v1', JSON.stringify({ anchor, fixtures, receipts: {}, rowReceipts: {}, importParties: {}, seq: 1 }));
      let travel = createRsvpAdapter({ storage: sessionStorage }); const v = (await travel.loadInvitation(token)).value;
      const answers = { responses: Object.fromEntries(v.members.map((m) => [m.id, m.responses])), arrival: null, departure: null, pickup: direction === 'arrival', drop: direction === 'departure', stay: 'needed', dietary: {}, accessibility: {} };
      const submitted = await travel.submitInvitation(token, newRequestId(), v.party.version, answers);
      travel = createRsvpAdapter({ storage: sessionStorage });
      const current = (await travel.loadEvent('tnp-manager', eventId)).value;
      const dispatch = await travel.mutate('tnp-manager', eventId, newRequestId(), { type: 'transfer', transferId: 'known-transfer', state: 'dispatched', baseVersion: current.dataRevision });
      const assign = await travel.mutate('tnp-manager', eventId, newRequestId(), { type: 'assign-vehicle', transferIds: ['known-transfer'], vehicleId: 'car', baseVersion: current.dataRevision });
      travelResults.push({ direction, submitted: submitted.ok, cleared: (await travel.loadInvitation(token)).value[direction], legs: current.legs.length, transfer: current.transfers[0], dispatch: dispatch.ok, assign: assign.ok });
    }
    return { keyChanged: moved[0].key !== rows[0].key, conflict: conflict.error.code, unchanged, travelResults };
  });
  assert.equal(result.keyChanged, true); assert.equal(result.conflict, 'conflict'); assert.equal(result.unchanged, true);
  for (const r of result.travelResults) {
    assert.equal(r.submitted, true); assert.equal(r.cleared, null); assert.equal(r.legs, 0);
    assert.equal(r.transfer.legId, null); assert.equal(r.transfer.vehicleId, null); assert.equal(r.transfer.planBasedOn, null); assert.equal(r.transfer.state, 'awaiting-details');
    assert.equal(r.dispatch, false); assert.equal(r.assign, false);
  }
  await page.goto(`${origin}/rsvp/events/evt-mehra-udaipur?view=movements`);
  await page.getByRole('heading', { name: 'Movement manifests', exact: true }).waitFor();
  await page.getByText('No planned movements yet. Plan requested transfers below.', { exact: true }).waitFor();
  assert.equal(await page.getByRole('heading', { name: 'Terminal 1 → Lake Hotel (flight)', exact: true }).count(), 0);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
  assert.deepEqual(errors, []);
  console.log('PASS: parser blank-line identity conflict/no mutation; arrival and departure null persist across adapter reload; obsolete legs/plans/vehicles cleared; dispatch and assignment reject; 390px Movements reload has no obsolete manifest, overflow or page errors.');
} finally { await browser.close(); }
