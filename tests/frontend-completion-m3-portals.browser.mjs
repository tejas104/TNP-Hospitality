import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(
  pathToFileURL(process.env.TNP_PLAYWRIGHT_MODULE).href
);
const origin = process.env.TNP_TEST_ORIGIN ?? 'http://127.0.0.1:3122',
  evidence = process.env.TNP_EVIDENCE_DIR;
if (!evidence) throw Error('Set evidence outside repository');
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const results = [];
async function fits(page, label) {
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
    false,
    label + ' horizontal overflow',
  );
}
async function identity(page, profileId, workspace) {
  await page.evaluate(
    ({ profileId, workspace }) =>
      sessionStorage.setItem(
        'tnp-demo-session-v1',
        JSON.stringify({ version: 1, profileId, workspace }),
      ),
    { profileId, workspace },
  );
}
try {
  for (const width of [1440, 1100, 390, 320]) {
    const context = await browser.newContext({
      viewport: { width, height: width < 700 ? 844 : 900 },
      isMobile: width < 700,
      hasTouch: width < 700,
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    page.setDefaultNavigationTimeout(90000);
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(origin + '/login', { waitUntil: 'networkidle' });
    await identity(page, 'planner-senior', 'tnp-planner');
    await page.goto(origin + '/planner', { waitUntil: 'networkidle' });
    await page
      .getByRole('heading', { name: 'Your planning workspace' })
      .waitFor();
    await page
      .getByText('Professional profile details', { exact: true })
      .click();
    await page
      .getByLabel('Relevant experience', { exact: true })
      .fill('Five years of synthetic event planning');
    await page.getByLabel('Cities you can work in').fill('Jaipur, Pune');
    await page
      .getByLabel('I understand that this is a synthetic application draft.')
      .check();
    await fits(page, 'Planner ' + width);
    await page.screenshot({
      path: evidence + '/planner-' + width + '.png',
      fullPage: true,
    });
    await identity(page, 'freelancer-explorer', 'freelancer');
    await page.goto(origin + '/freelancer', { waitUntil: 'networkidle' });
    await page
      .getByRole('heading', { name: 'Your freelancer workspace' })
      .waitFor();
    await page
      .locator('#freelancer-profile')
      .selectOption('tnp-demo-worker-007');
    await page.getByRole('button', { name: /pass & attendance/ }).click();
    await page
      .getByRole('heading', { name: 'Pass and attendance', exact: true })
      .waitFor();
    await fits(page, 'Freelancer pass ' + width);
    await page.getByRole('button', { name: /earnings & standing/ }).click();
    await page
      .getByRole('heading', { name: 'Earnings, payouts and standing' })
      .waitFor();
    await fits(page, 'Freelancer earnings ' + width);
    await page.screenshot({ path: evidence + '/freelancer-' + width + '.png' });
    await identity(page, 'operations-reviewer', 'operations');
    await page.goto(origin + '/operations', { waitUntil: 'networkidle' });
    const opsNav = page;
    await opsNav
      .getByRole('button', { name: 'Quotes & earnings', exact: true })
      .click();
    await page
      .getByRole('heading', { name: 'Quotes and workforce earnings' })
      .waitFor();
    await page
      .locator('button')
      .filter({ hasText: /tnp-demo-quote/ })
      .first()
      .click();
    await page
      .getByLabel('Revision reason', { exact: true })
      .fill('Sample wording and rate review');
    await page
      .getByRole('button', { name: 'Save sample revision', exact: true })
      .click();
    await page.getByText(/Sample quote revision completed/).waitFor();
    await fits(page, 'Operations quotes ' + width);
    await page.getByRole('button', { name: 'Earnings', exact: true }).click();
    await page
      .locator('button')
      .filter({ hasText: /tnp-demo-worker/ })
      .first()
      .click();
    await fits(page, 'Operations earnings ' + width);
    await page.screenshot({ path: evidence + '/operations-' + width + '.png' });
    await opsNav
      .getByRole('button', { name: 'Catalogue & access', exact: true })
      .click();
    await page
      .getByLabel('Change reason', { exact: true })
      .fill('Sample review reason');
    await page
      .getByRole('button', { name: 'Prepare local draft', exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Mark ready for review', exact: true })
      .click();
    await page.getByText(/Ready for human review/).waitFor();
    await fits(page, 'Catalogue ' + width);
    await page.goto(origin + '/rsvp/login', { waitUntil: 'networkidle' });
    await page
      .getByRole('button', { name: 'Enter sample RSVP team', exact: true })
      .click();
    await page
      .getByRole('heading', { name: 'Today, across your events.' })
      .waitFor();
    await page.getByRole('link', { name: 'Open next event →' }).click();
    await page
      .getByRole('button', { name: 'WhatsApp inbox', exact: true })
      .click();
    await page.getByRole('button', { name: /Sample Mehta family/ }).click();
    const original = await page.locator('blockquote').innerText();
    await page.getByLabel('Party size', { exact: true }).fill('4');
    await page.getByLabel('Confirmed response').selectOption('yes');
    await page
      .getByRole('button', { name: 'Save sample review', exact: true })
      .click();
    await page.getByText(/Human review recorded/).waitFor();
    assert.equal(await page.locator('blockquote').innerText(), original);
    await page.getByLabel('Entitlement preview').selectOption('suspended');
    await page.getByRole('button', { name: /Sample Mehta family/ }).click();
    assert.equal(
      await page
        .getByRole('button', { name: 'Save sample review', exact: true })
        .isDisabled(),
      true,
    );
    await page.getByLabel('Entitlement preview').selectOption('active');
    await page.getByRole('button', { name: 'Guests', exact: true }).click();
    await page
      .getByLabel('Paste simple CSV (name,party,people)')
      .fill('name,party,people\nSample imported party,Party Z,3');
    await page
      .getByRole('button', { name: 'Validate and import locally', exact: true })
      .click();
    await page.getByText(/1 sample parties imported/).waitFor();
    await page.getByRole('button', { name: 'Campaigns', exact: true }).click();
    await page
      .getByRole('button', { name: 'Simulate local queue', exact: true })
      .click();
    await page.getByText('queued-preview', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Reports', exact: true }).click();
    await page.getByLabel('Sample capability role').selectOption('operator');
    assert.equal(
      await page
        .getByRole('button', { name: 'Download sample CSV', exact: true })
        .isDisabled(),
      true,
    );
    await page.getByLabel('Sample capability role').selectOption('manager');
    await page.getByLabel('Sample entitlement date').fill('2026-10-01');
    assert.equal(
      await page
        .getByRole('button', { name: 'Download sample CSV', exact: true })
        .isDisabled(),
      true,
    );
    await page.getByLabel('Sample entitlement date').fill('2026-09-24');
    const download = page.waitForEvent('download');
    await page
      .getByRole('button', { name: 'Download sample CSV', exact: true })
      .click();
    assert.match((await download).suggestedFilename(), /lotus-evening/);
    await fits(page, 'RSVP ' + width);
    await page.screenshot({ path: evidence + '/rsvp-' + width + '.png' });
    await page.getByLabel('Sample organization').selectOption('marigold');
    await page.waitForURL('**/rsvp/workspace?organization=marigold');
    await page.getByRole('link', { name: 'Open next event →' }).click();
    await page.getByRole('button', { name: 'Guests', exact: true }).click();
    assert.equal(
      await page.getByRole('button', { name: /Sample imported party/ }).count(),
      0,
    );
    await page.getByRole('button', { name: /Sample Mehta family/ }).click();
    assert.equal(
      await page.getByLabel('Party size', { exact: true }).inputValue(),
      '2',
    );
    for (const mode of ['loading', 'empty', 'error']) {
      await page.getByLabel('View state').selectOption(mode);
      await fits(page, 'RSVP ' + mode + ' ' + width);
      await page.getByLabel('View state').selectOption('ready');
    }
    await page.goto(origin + '/rsvp/guest/synthetic-token', {
      waitUntil: 'networkidle',
    });
    await page
      .getByRole('heading', { name: 'This invitation cannot be opened here.' })
      .waitFor();
    assert.equal(
      await page.getByRole('button', { name: 'Switch demo profile' }).count(),
      0,
    );
    await fits(page, 'Guest ' + width);
    await page.goto(origin + '/services/rsvp', { waitUntil: 'networkidle' });
    await fits(page, 'Public detail ' + width);
    if (width === 320) {
      await page.goto(origin + '/contact', { waitUntil: 'networkidle' });
      await page.setViewportSize({ width: 320, height: 400 });
      const input = page.getByLabel('Sample email', { exact: false });
      await input.focus();
      await input.scrollIntoViewIfNeeded();
      const b = await input.boundingBox();
      assert.ok(b && b.y >= 0 && b.y + b.height <= 400);
      await fits(page, 'Keyboard-height contact');
      await page.setViewportSize({ width: 320, height: 900 });
    }
    assert.deepEqual(errors, []);
    results.push({ width, pass: true, errors });
    await context.close();
    console.log('Passed B viewport', width);
  }
  const zoomContext = await browser.newContext({
    viewport: { width: 1100, height: 900 },
  });
  const zoomPage = await zoomContext.newPage();
  zoomPage.setDefaultTimeout(90000);
  await zoomPage.goto(origin + '/login', { waitUntil: 'networkidle' });
  await zoomPage.evaluate(() => (document.documentElement.style.zoom = '2'));
  await fits(zoomPage, '200% CSS zoom access');
  await zoomPage.screenshot({
    path: evidence + '/access-200-percent-css-zoom.png',
  });
  await zoomContext.close();
  await writeFile(
    evidence + '/checkpoint-b-browser.json',
    JSON.stringify(
      {
        results,
        zoom: '200% CSS zoom, not browser chrome zoom',
        keyboard: '320x400 viewport simulation, not physical keyboard',
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
