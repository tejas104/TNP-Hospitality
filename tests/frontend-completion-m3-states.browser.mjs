import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(
  pathToFileURL(process.env.TNP_PLAYWRIGHT_MODULE).href
);
const origin = process.env.TNP_TEST_ORIGIN ?? 'http://127.0.0.1:3122',
  out = process.env.TNP_EVIDENCE_DIR;
if (!out) throw Error('External evidence directory required');
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await context.newPage();
page.setDefaultTimeout(20000);
page.setDefaultNavigationTimeout(90000);
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const fits = async () =>
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
    false,
  );
const choose = async (profileId, workspace) =>
  page.evaluate(
    ({ profileId, workspace }) =>
      sessionStorage.setItem(
        'tnp-demo-session-v1',
        JSON.stringify({ version: 1, profileId, workspace }),
      ),
    { profileId, workspace },
  );
try {
  await page.goto(origin + '/login', { waitUntil: 'networkidle' });
  await choose('operations-reviewer', 'operations');
  await page.goto(origin + '/operations', { waitUntil: 'networkidle' });
  await page
    .getByRole('button', { name: 'Attendance exceptions', exact: true })
    .click();
  const correction = page
    .locator('form')
    .filter({
      has: page.getByRole('heading', {
        name: 'Preserve original evidence',
        exact: true,
      }),
    });
  await correction
    .getByLabel('Attendance', { exact: false })
    .selectOption('tnp-demo-attendance-001');
  await correction.getByRole('button', { name: 'Submit correction' }).click();
  await page.getByText(/Attendance correction completed/).waitFor();
  await page
    .getByRole('button', { name: 'Quotes & earnings', exact: true })
    .click();
  await page.getByRole('button', { name: 'Earnings', exact: true }).click();
  await page.getByRole('button', { name: /tnp-demo-worker-002/ }).click();
  await page
    .getByRole('button', { name: 'Approve as sample supervisor', exact: true })
    .click();
  await page.getByText(/Sample supervisor approval completed/).waitFor();
  await page
    .getByRole('button', { name: 'Approve as sample finance', exact: true })
    .click();
  await page.getByText(/Sample finance approval completed/).waitFor();
  await page.getByText(/Finance: tnp-demo-finance-001/).waitFor();
  await page.screenshot({
    path: out + '/finance-two-stage-approval.png',
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Quotes', exact: true }).click();
  await page
    .getByRole('button', { name: /tnp-demo-quote/ })
    .first()
    .click();
  await page.emulateMedia({ media: 'print' });
  assert.equal(await page.locator('.site-nav').isVisible(), false);
  assert.equal(await page.locator('[data-sample-quote]').isVisible(), true);
  await page.pdf({
    path: out + '/sample-quote-print.pdf',
    format: 'A4',
    printBackground: true,
  });
  await page.emulateMedia({ media: 'screen' });
  for (const [path, id, workspace] of [
    ['/operations', 'operations-reviewer', 'operations'],
    ['/planner', 'planner-senior', 'tnp-planner'],
    ['/freelancer', 'freelancer-explorer', 'freelancer'],
    ['/rsvp/workspace', 'rsvp-team', 'rsvp'],
  ]) {
    await choose(id, workspace);
    await page.goto(origin + path, { waitUntil: 'networkidle' });
    await page.evaluate(() => (document.documentElement.style.zoom = '2'));
    await fits();
    await page.screenshot({ path: out + '/zoom-' + workspace + '.png' });
    await page.evaluate(() => (document.documentElement.style.zoom = '1'));
  }
  await page.goto(origin + '/login', { waitUntil: 'networkidle' });
  await page.emulateMedia({ forcedColors: 'active' });
  const action = page.locator('.ux-action').first();
  await action.focus();
  const forced = await action.evaluate((e) => ({
    outline: getComputedStyle(e).outlineStyle,
    border: getComputedStyle(e).borderStyle,
    color: getComputedStyle(e).color,
  }));
  assert.notEqual(forced.outline, 'none');
  assert.notEqual(forced.border, 'none');
  await page.screenshot({ path: out + '/forced-colors-access.png' });
  await page.emulateMedia({ forcedColors: 'none' });
  await choose('planner-suspended', 'tnp-planner');
  await page.goto(origin + '/planner', { waitUntil: 'networkidle' });
  await page.waitForURL('**/login?workspace=tnp-planner');
  assert.equal(
    await page
      .getByRole('heading', { name: 'Your planning workspace' })
      .count(),
    0,
  );
  const tab2 = await context.newPage();
  await tab2.goto(origin + '/login', { waitUntil: 'networkidle' });
  assert.equal(
    await tab2.evaluate(() => sessionStorage.getItem('tnp-demo-session-v1')),
    null,
  );
  await tab2.close();
  const denied = await browser.newContext();
  await denied.addInitScript(() => {
    for (const method of ['getItem', 'setItem', 'removeItem'])
      Storage.prototype[method] = () => {
        throw Error('Synthetic storage denial');
      };
  });
  const blocked = await denied.newPage();
  blocked.setDefaultTimeout(20000);
  await blocked.goto(origin + '/login?workspace=tnp-planner', {
    waitUntil: 'networkidle',
  });
  await blocked.getByRole('button', { name: 'Enter as Riya Mehta' }).click();
  await blocked.waitForURL('**/planner');
  await blocked
    .getByText(/memory only|memory-only|storage unavailable/i)
    .first()
    .waitFor();
  await blocked.screenshot({ path: out + '/storage-denied.png' });
  await denied.close();
  assert.deepEqual(errors, []);
  await writeFile(
    out + '/advanced-browser.json',
    JSON.stringify(
      {
        financeApproval: 'supervisor then distinct finance actor',
        print: 'A4 PDF; sample mark; app chrome hidden',
        zoom: '200% CSS zoom on all four workspace families',
        forcedColors: forced,
        access:
          'suspended denied; two tabs isolated; storage denial memory-only',
        errors,
      },
      null,
      2,
    ),
  );
  console.log('Advanced browser checks passed');
} finally {
  await browser.close();
}
