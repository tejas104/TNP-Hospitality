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
    const { historicalImport, historicalTravel, completedGuardIsolation } = await import('/components/tnp/portals/rsvp/round5-scenarios.mjs');
    return [await historicalImport(), await historicalTravel('arrival'), await historicalTravel('departure'), await completedGuardIsolation()];
  });
  assert.deepEqual(checks, [true, true, true, true]);
  assert.deepEqual(errors, []);
  console.log('PASS: actual browser-loaded modules replay retained duplicate outcomes; clear both travel directions preserves historical manifests/snapshots and blocks active assignment/dispatch; restoring details cannot overwrite historical legs. No page errors.');
} finally { await browser.close(); }
