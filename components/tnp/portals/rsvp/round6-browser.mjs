import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.RSVP_PLAYWRIGHT_MODULE).href);
const browser = await chromium.launch({ executablePath: process.env.RSVP_CHROME, headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
try {
  await page.goto('http://127.0.0.1:3107/rsvp/login');
  await page.waitForFunction(() => sessionStorage.getItem('tnp-preloader-seen') === 'true');
  await page.getByRole('button', { name: 'Sample TNP service manager', exact: false }).click();
  await page.waitForFunction(() => sessionStorage.getItem('tnp-rsvp-preview-persona') === 'tnp-manager');
  const checks = await page.evaluate(async () => {
    const { restoredIdentity, intentProjection } = await import('/components/tnp/portals/rsvp/round6-scenarios.mjs');
    return [await restoredIdentity('pickup'), await restoredIdentity('drop'), await intentProjection('pickup'), await intentProjection('drop')];
  });
  assert.deepEqual(checks, [true, true, true, true]);
  assert.deepEqual(errors, []);
  console.log('PASS: browser-loaded pickup/drop three-cycle unique identity, exact replay, targeted lifecycle mutations, all-state current intent projection, reload false and unchanged false no resurrection; historical manifests preserved; no page errors.');
} finally { await browser.close(); }
