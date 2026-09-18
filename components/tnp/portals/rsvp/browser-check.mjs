// Run with RSVP_PLAYWRIGHT_MODULE pointing to an existing playwright-core module.
// No browser or package installation is performed. Artifacts stay under this owned directory.
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.RSVP_PLAYWRIGHT_MODULE).href);
const origin = process.env.RSVP_ORIGIN ?? 'http://127.0.0.1:3107';
const browser = await chromium.launch({ executablePath: process.env.RSVP_CHROME, headless: true });
const errors = [];
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => { if (message.type() === 'error') errors.push(`${message.text()} ${message.location().url}`); });
page.on('response', (response) => { if (response.status() >= 400) log('HTTP response', `${response.status()} ${response.url()}`); });
page.setDefaultTimeout(15000);
const route = `${origin}/rsvp/events/evt-mehra-udaipur`;
const log = (label, value = 'PASS') => console.log(label, value);
async function ready(title) {
  await page.getByRole('heading', { name: title, exact: true, level: 1 }).waitFor();
  await page.locator('[aria-busy="false"]').first().waitFor();
  await page.waitForFunction(() => !document.querySelector('.preloader.active'));
}
async function go(view, title) { await page.goto(`${route}?view=${view}`); await ready(title); }
try {
  await page.goto(`${origin}/rsvp/login`);
  // The development RSC shell is visible before its client hydration finishes.
  await page.waitForFunction(() => Object.keys(document.querySelector('main') ?? {}).some((key) => key.startsWith('__reactFiber')));
  await page.waitForFunction(() => sessionStorage.getItem('tnp-preloader-seen') === 'true' && !document.querySelector('.preloader.active'));
  await page.getByRole('button', { name: 'Sample TNP service manager', exact: false }).click();
  await page.waitForFunction(() => sessionStorage.getItem('tnp-rsvp-preview-persona') === 'tnp-manager');
  await go('overview', 'Overview');
  for (const width of [1440, 1101, 1100, 390, 320]) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 900 });
    await page.getByRole('heading', { name: 'Where things stand' }).waitFor();
    await page.waitForFunction(() => [...document.querySelectorAll('main img')].every((image) => image.complete));
    await page.evaluate(() => Promise.all(document.getAnimations().filter((a) => a.effect?.getTiming().iterations !== Infinity).map((a) => a.finished.catch(() => {}))));
    const sizes = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth, hero: document.querySelector('[aria-labelledby="event-identity"]').getBoundingClientRect().height, metricsTop: document.getElementById('metrics-heading').getBoundingClientRect().top }));
    assert.ok(sizes.scroll <= width + 1, JSON.stringify(sizes));
    if (width < 500) assert.ok(sizes.hero < 370, JSON.stringify(sizes));
    await page.screenshot({ path: new URL(`./browser-${width}.png`, import.meta.url).pathname.replace(/^\/(\w:)/, '$1') });
    log(`overview ${width}`, sizes);
  }
  // Native dialog keyboard navigation must move focus after its close event.
  await page.getByRole('button', { name: 'Sections', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('dialog', { name: 'Workspace sections' }).waitFor();
  await page.getByRole('dialog').getByRole('button', { name: 'Calling queue', exact: true }).focus();
  await page.keyboard.press('Space');
  await ready('Calling queue');
  await page.waitForFunction(() => document.activeElement?.textContent === 'Calling queue');
  log('drawer Enter/Space navigation destination focus');
  await page.getByRole('button', { name: 'Sections', exact: true }).click();
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.activeElement?.textContent?.trim() === 'Sections');
  log('drawer Escape opener focus');

  const queue = page.getByRole('list', { name: 'Calling queue', exact: true });
  const buttons = queue.getByRole('button');
  const second = await buttons.nth(1).locator('strong').innerText();
  await buttons.nth(1).click();
  await page.waitForFunction((name) => document.getElementById('call-card-title')?.textContent === name, second);
  const url2 = page.url();
  assert.ok(new URL(url2).searchParams.get('party'));
  const third = await buttons.nth(2).locator('strong').innerText();
  await buttons.nth(2).click();
  await page.waitForFunction((name) => document.getElementById('call-card-title')?.textContent === name, third);
  assert.notEqual(second, third);
  await page.goBack();
  await page.waitForFunction((name) => document.getElementById('call-card-title')?.textContent === name, second);
  await page.goForward();
  await page.waitForFunction((name) => document.getElementById('call-card-title')?.textContent === name, third);
  await page.reload(); await ready('Calling queue');
  assert.equal(await page.locator('#call-card-title').innerText(), third);
  await page.goto(url2); await ready('Calling queue');
  assert.equal(await page.locator('#call-card-title').innerText(), second);
  await page.goto(`${route}?view=calls&party=evt-kapoor-jaipur-p1`); await ready('Calling queue');
  assert.ok(!await page.locator('#call-card-title').innerText().then((t) => t.includes('Kapoor')));
  log('Calls URL selection, refresh, direct link, Back/Forward and foreign party');

  await go('reports', 'Reports & exports');
  await page.getByRole('button', { name: 'Generate Master guest list preview', exact: true }).click();
  await page.getByRole('button', { name: 'Download CSV', exact: true }).waitFor();
  await page.getByRole('checkbox', { name: 'Use the current guest directory filters' }).check();
  assert.equal(await page.getByRole('button', { name: 'Download CSV', exact: true }).count(), 0);
  await page.getByRole('heading', { name: 'Generate a new revision' }).waitFor();
  await page.getByRole('button', { name: 'Generate Master guest list preview', exact: true }).click();
  await page.getByRole('button', { name: 'Download CSV', exact: true }).waitFor();
  log('report scope change disables preview and export until regeneration');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  const spinner = await page.evaluate(() => {
    // Exercise the actual loaded CSS class on a temporary icon, including its media override.
    const rules = [...document.styleSheets].flatMap((s) => { try { return [...s.cssRules]; } catch { return []; } });
    const rule = rules.find((r) => r.selectorText?.includes('spin') && r.style?.animation?.includes('infinite'));
    if (!rule) throw new Error('Spinner rule not found');
    const node = document.createElement('span'); node.className = rule.selectorText.slice(1); document.querySelector('main').append(node);
    const style = getComputedStyle(node); const result = { animation: style.animationName, transform: style.transform }; node.remove(); return result;
  });
  assert.equal(spinner.animation, 'none'); assert.equal(spinner.transform, 'none');
  log('reduced-motion static spinner', spinner);
  for (const width of [1440, 1101, 1100, 390, 320]) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 900 });
    for (const [view, title] of [['today', 'Today'], ['calendar', 'Service calendar'], ['guests', 'Guests & parties'], ['add', 'Add a party'], ['import', 'Import CSV'], ['travel', 'Travel'], ['movements', 'Pickup & drop'], ['rooming', 'Stay & rooming'], ['messages', 'Messages'], ['documents', 'Documents']]) {
      await go(view, title);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `overflow ${width} ${view}`);
    }
    log(`${width}px ten workspace sections load/overflow`);
  }
  // Scope the test fixture to this isolated browser tab. The same production-disabled
  // UI must surface the adapter's rejection of existing vehicle commitments.
  await page.evaluate(() => {
    const state = JSON.parse(sessionStorage.getItem('tnp-rsvp-synthetic-v1'));
    const d = state.fixtures.events['evt-mehra-udaipur'];
    const members = d.members.filter((m) => !m.removed).slice(0, 4);
    members.forEach((m) => { m.responses = Object.fromEntries(m.invitedFunctionIds.map((id) => [id, 'confirmed'])); });
    d.vehicles = [{ id: 'test-car', eventId: d.event.id, label: 'Test car', seats: 3, driver: 'Sample driver' }];
    d.legs = [0, 1].map((i) => ({ ...d.legs[0], id: `leg${i}`, at: new Date().toISOString().slice(0, 10) + 'T04:30:00Z', passengerIds: members.slice(i * 2, i * 2 + 2).map((m) => m.id), partyId: members[i * 2].partyId, mode: 'flight' }));
    d.transfers = d.legs.map((l, i) => ({ id: `t${i}`, partyId: l.partyId, legId: l.id, kind: 'pickup', state: i ? 'planned' : 'assigned', vehicleId: i ? null : 'test-car', planBasedOn: l.at }));
    sessionStorage.setItem('tnp-rsvp-synthetic-v1', JSON.stringify(state));
  });
  await go('movements', 'Pickup & drop');
  const vehicleSelect = page.getByLabel('Vehicle and driver').last();
  await vehicleSelect.selectOption('test-car');
  await page.getByRole('button', { name: 'Assign', exact: true }).last().click();
  await page.getByText('4 passengers exceed 3 seats', { exact: true }).waitFor();
  log('browser existing vehicle capacity rejection');
  await page.evaluate(() => {
    const state = JSON.parse(sessionStorage.getItem('tnp-rsvp-synthetic-v1'));
    const d = state.fixtures.events['evt-mehra-udaipur'];
    d.vehicles[0].seats = 12; d.legs[1].mode = 'train';
    sessionStorage.setItem('tnp-rsvp-synthetic-v1', JSON.stringify(state));
  });
  await go('movements', 'Pickup & drop');
  await page.getByLabel('Vehicle and driver').last().selectOption('test-car');
  await page.getByRole('button', { name: 'Assign', exact: true }).last().click();
  await page.getByText('Test car is also assigned to another movement in this window', { exact: true }).waitFor();
  log('browser existing vehicle overlap rejection');
  await page.evaluate(() => {
    const state = JSON.parse(sessionStorage.getItem('tnp-rsvp-synthetic-v1'));
    const d = state.fixtures.events['evt-mehra-udaipur'];
    d.hotels = [{ id: 'test-hotel', eventId: d.event.id, name: 'Sample hotel', categories: [{ id: 'test-double', name: 'Double', inventory: 10, maxOccupancy: 2 }] }];
    d.stays = [{ ...d.stays[0], state: 'requested', hotelId: null, categoryId: null, occupantIds: d.members.filter((m) => !m.removed).slice(0, 3).map((m) => m.id) }];
    sessionStorage.setItem('tnp-rsvp-synthetic-v1', JSON.stringify(state));
  });
  await go('rooming', 'Stay & rooming');
  await page.getByRole('button', { name: 'Propose a room', exact: true }).click();
  await page.getByRole('dialog').getByLabel('Room category').selectOption('test-double');
  assert.equal(await page.getByRole('dialog').getByRole('button', { name: 'Propose a room', exact: true }).isDisabled(), true);
  await page.getByRole('dialog').getByText(/3 occupants exceed/).waitFor();
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  log('room proposal occupancy conflict visible and submission blocked');
  await go('guests', 'Guests & parties');
  await page.getByPlaceholder('Name, reference, phone or email').fill('no-such-synthetic-party');
  await page.getByText(/No parties match/).first().waitFor();
  await page.getByRole('button', { name: 'Clear search', exact: true }).click();
  log('filtered-empty and clear-search recovery');

  const touch = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  const phone = await touch.newPage();
  phone.on('pageerror', (e) => errors.push(e.message));
  await phone.goto(`${origin}/rsvp/login`);
  await phone.waitForFunction(() => sessionStorage.getItem('tnp-preloader-seen') === 'true');
  await phone.getByRole('button', { name: 'Sample TNP service manager', exact: false }).tap();
  await phone.waitForFunction(() => sessionStorage.getItem('tnp-rsvp-preview-persona') === 'tnp-manager');
  await phone.goto(`${route}?view=overview`);
  await phone.getByRole('heading', { name: 'Overview', exact: true, level: 1 }).waitFor();
  assert.equal(await phone.evaluate(() => matchMedia('(pointer: coarse)').matches), true);
  await phone.getByRole('button', { name: 'Sections', exact: true }).tap();
  await phone.getByRole('dialog').getByRole('button', { name: 'Guests & parties', exact: true }).tap();
  await phone.getByRole('heading', { name: 'Guests & parties', exact: true, level: 1 }).waitFor();
  log('390px touch/coarse reduced-motion drawer navigation');
  await phone.goto(`${origin}/rsvp/invite/mrw-guest-0101`);
  await phone.getByRole('button', { name: 'Begin', exact: true }).waitFor();
  await phone.getByRole('button', { name: 'Begin', exact: true }).tap();
  await phone.getByRole('button', { name: 'Next', exact: true }).tap();
  const declines = phone.getByLabel('Not attending', { exact: true });
  assert.ok(await declines.count() > 0);
  for (let i = 0; i < await declines.count(); i++) await declines.nth(i).check();
  await phone.getByRole('button', { name: 'Next', exact: true }).tap();
  await phone.getByRole('heading', { name: 'Review', level: 1, exact: true }).waitFor();
  log('guest invitation touch steps skip logistics after all-declined answers');
  await touch.close();
  log('console/page errors', errors);
  assert.equal(errors.filter((e) => !e.includes('net::ERR') && !e.includes('favicon')).length, 0);
} finally {
  await browser.close();
}
