import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.RSVP_PLAYWRIGHT_MODULE).href);
const browser = await chromium.launch({ executablePath: process.env.RSVP_CHROME, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const origin = process.env.RSVP_ORIGIN ?? 'http://127.0.0.1:3107';
const route = `${origin}/rsvp/events/evt-mehra-udaipur`;
page.setDefaultTimeout(15000);
try {
  await page.goto(`${origin}/rsvp/login`);
  await page.waitForFunction(() => sessionStorage.getItem('tnp-preloader-seen') === 'true');
  await page.getByRole('button', { name: 'Sample TNP service manager', exact: false }).click();
  await page.waitForFunction(() => sessionStorage.getItem('tnp-rsvp-preview-persona') === 'tnp-manager');
  await page.goto(`${route}?view=import`);
  await page.getByRole('button', { name: 'Valid sample', exact: true }).click();
  await page.getByRole('button', { name: 'Validate rows', exact: true }).click();
  await page.getByRole('button', { name: 'Continue with 5 ready rows', exact: true }).click();
  await page.getByRole('checkbox', { name: /I confirm these guests belong/ }).check();
  await page.getByText('Preview conditions', { exact: true }).click();
  await page.getByLabel('Next request simulates').selectOption('partial-import');
  await page.getByRole('button', { name: 'Import guests', exact: true }).click();
  await page.getByRole('heading', { name: 'Partially imported', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Retry 1 eligible rows', exact: true }).click();
  await page.getByRole('heading', { name: 'All ready rows imported', exact: true }).waitFor();
  console.log('UI import partial failure -> exact failed-row retry: PASS');

  const identity = await page.evaluate(async () => {
    const { createRsvpAdapter } = await import('/components/tnp/portals/rsvp/adapter.ts');
    const { previewImport } = await import('/components/tnp/portals/rsvp/importer.ts');
    const a = createRsvpAdapter();
    const data = (await a.loadEvent('tnp-manager', 'evt-mehra-udaipur')).value;
    const csv = 'guest_ref,party_name,member_name,phone,functions\nBROWSER-R2,Sample Family,Sample Guest,+915550123456,all';
    const rows = previewImport(csv, null, data).rows;
    const first = await a.applyImport('tnp-manager', data.event.id, 'same-batch', rows);
    const before = JSON.stringify((await a.loadEvent('tnp-manager', data.event.id)).value);
    const replay = await a.applyImport('tnp-manager', data.event.id, 'same-batch', rows);
    const changed = structuredClone(rows); changed[0].values.phone = '+915559999999';
    const conflict = await a.applyImport('tnp-manager', data.event.id, 'same-batch', changed);
    const after = JSON.stringify((await a.loadEvent('tnp-manager', data.event.id)).value);
    const other = (await a.loadEvent('marigold-owner', 'evt-kapoor-jaipur')).value;
    const isolated = await a.applyImport('marigold-owner', other.event.id, 'same-batch', previewImport(csv, null, other).rows);
    return { first: first.value[0].result, replayed: replay.value[0].replayed, conflict: conflict.error.code, unchanged: before === after, isolated: isolated.value[0] };
  });
  assert.equal(identity.first, 'accepted'); assert.equal(identity.replayed, true); assert.equal(identity.conflict, 'conflict'); assert.equal(identity.unchanged, true); assert.equal(identity.isolated.result, 'accepted'); assert.equal(identity.isolated.replayed, false);
  console.log('Browser-loaded adapter replay, changed-phone no-mutation and cross-org isolation: PASS');

  await page.evaluate(() => {
    const state = JSON.parse(sessionStorage.getItem('tnp-rsvp-synthetic-v1'));
    const d = state.fixtures.events['evt-mehra-udaipur']; const members = d.members.filter((m) => !m.removed).slice(0, 4);
    members.forEach((m) => { m.responses = Object.fromEntries(m.invitedFunctionIds.map((id) => [id, 'confirmed'])); });
    d.vehicles = [{ id: 'test-car', eventId: d.event.id, label: 'Test car', seats: 12, driver: 'Sample driver' }];
    d.legs = [0, 1].map((i) => ({ ...d.legs[0], id: `leg${i}`, at: new Date().toISOString().slice(0, 10) + 'T04:30:00Z', passengerIds: members.slice(i * 2, i * 2 + 2).map((m) => m.id), partyId: members[i * 2].partyId, mode: 'flight', from: `Terminal ${i + 1}`, to: 'Lake Hotel', direction: 'arrival' }));
    d.transfers = d.legs.map((l, i) => ({ id: `t${i}`, partyId: l.partyId, legId: l.id, kind: 'pickup', state: i ? 'planned' : 'assigned', vehicleId: i ? null : 'test-car', planBasedOn: l.at }));
    sessionStorage.setItem('tnp-rsvp-synthetic-v1', JSON.stringify(state));
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${route}?view=movements`);
  await page.getByRole('heading', { name: 'Terminal 2 → Lake Hotel (flight)', exact: true }).waitFor();
  await page.getByLabel('Vehicle and driver').last().selectOption('test-car');
  await page.getByRole('button', { name: 'Assign', exact: true }).last().click();
  await page.getByText('Test car is also assigned to another movement in this window', { exact: true }).waitFor();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
  console.log('390px actual endpoint labels and same-mode/different-terminal overlap rejection: PASS');
  assert.deepEqual(errors, []);
  console.log('Browser page errors: none');
} finally {
  await browser.close();
}
