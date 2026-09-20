import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(
  pathToFileURL(process.env.TNP_PLAYWRIGHT_MODULE).href
);
const origin = process.env.TNP_TEST_ORIGIN ?? 'http://127.0.0.1:3122';
const evidence = process.env.TNP_EVIDENCE_DIR;
if (!evidence) throw Error('Set evidence outside repository');
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const results = [];
try {
  for (const width of [1440, 1100, 390, 320]) {
    const context = await browser.newContext({
      viewport: { width, height: width < 700 ? 844 : 900 },
      isMobile: width < 700,
      hasTouch: width < 700,
    });
    const page = await context.newPage();
    page.setDefaultTimeout(90000);
    page.setDefaultNavigationTimeout(90000);
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(origin, { waitUntil: 'networkidle', timeout: 90000 });
    await page.locator('.preloader.active').waitFor({ state: 'hidden' });
    assert.equal(
      await page.locator('.workspace-trigger,.workspace-explorer').count(),
      0,
    );
    const trigger = page.getByRole('button', {
      name: 'Workspaces',
      exact: true,
    });
    await trigger.click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    await page.waitForTimeout(450);
    assert.deepEqual(await dialog.locator('nav a strong').allTextContents(), [
      'TNP Planner',
      'Freelancer',
    ]);
    await page.keyboard.press('Tab');
    assert.ok(await dialog.evaluate((e) => e.contains(document.activeElement)));
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('dialog[open]'));
    assert.equal(
      await trigger.evaluate((e) => e === document.activeElement),
      true,
    );
    await trigger.click();
    await page.getByRole('button', { name: 'Close workspaces' }).click();
    await page.waitForFunction(() => !document.querySelector('dialog[open]'));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await trigger.click();
    assert.equal(await dialog.evaluate((e) => e.getAnimations().length), 0);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('dialog[open]'));
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    if (width === 320) {
      for (let y = 0; y <= 1200; y += 15) {
        await page.evaluate((y) => scrollTo(0, y), y);
        const hit = await trigger.evaluate((e) => {
          const r = e.getBoundingClientRect();
          return {
            y: r.y,
            bottom: r.bottom,
            position: getComputedStyle(e.closest('header')).position,
          };
        });
        assert.equal(hit.position, 'absolute');
        assert.ok(hit.bottom <= 90 - y + 4);
      }
      await page.evaluate(() => scrollTo(0, 0));
    }
    await page.goto(origin + '/client', { waitUntil: 'networkidle' });
    await page.waitForURL('**/contact?interest=event-request');
    await page
      .getByRole('button', { name: 'Save synthetic enquiry', exact: true })
      .click();
    await page.getByText('Enter a sample name of 1–100 characters.').waitFor();
    await page
      .getByRole('button', { name: 'Just talk to TNP', exact: true })
      .click();
    await page
      .getByLabel('Sample name', { exact: false })
      .fill('Sample Visitor');
    await page
      .getByLabel('Sample email', { exact: false })
      .fill('visitor@example.com');
    await page
      .getByLabel('Tell us about your plans', { exact: false })
      .fill('Please discuss our sample event.');
    await page
      .getByRole('button', { name: 'Save synthetic enquiry', exact: true })
      .click();
    await page.getByText('YOUR SYNTHETIC RECEIPT', { exact: true }).waitFor();
    const receipt = await page
      .locator('[class*="receipt"] strong')
      .textContent();
    await page.getByRole('button', { name: 'Replay same request' }).click();
    await page.getByText(/Repeated request recovered/).waitFor();
    assert.equal(
      await page.locator('[class*="receipt"] strong').textContent(),
      receipt,
    );
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByText(/Saved synthetic receipt restored/).waitFor();
    await page.getByRole('button', { name: 'Start a new enquiry' }).click();
    await page
      .getByRole('button', { name: 'Plan an event', exact: true })
      .click();
    await page.getByLabel('Sample occasion').fill('Sample wedding');
    await page.getByLabel('Sample city').fill('Pune');
    await page.getByLabel('Hospitality workforce', { exact: true }).check();
    await page.getByLabel('RSVP', { exact: true }).check();
    await page.getByLabel('Hostess quantity').fill('4');
    await page.getByLabel('I already have a venue').check();
    await page
      .getByLabel('Sample name', { exact: false })
      .fill('Sample Planner');
    await page
      .getByLabel('Sample email', { exact: false })
      .fill('planner@example.com');
    await page
      .getByLabel('Tell us about your plans', { exact: false })
      .fill('Please discuss workforce and messaging.');
    await page
      .getByRole('button', { name: 'Save synthetic enquiry', exact: true })
      .click();
    await page.getByText('YOUR SYNTHETIC RECEIPT', { exact: true }).waitFor();
    await page.getByText('Review saved request', { exact: true }).click();
    assert.match(
      await page.locator('[class*="receipt"]').innerText(),
      /Hostess: 4/,
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.screenshot({ path: `${evidence}/contact-${width}.png` });
    await page.goto(origin + '/login?workspace=operations', {
      waitUntil: 'networkidle',
    });
    assert.equal(
      await page.getByRole('link', { name: /Choose Operations/ }).count(),
      0,
    );
    assert.equal(
      await page.getByRole('link', { name: /Choose Client/ }).count(),
      0,
    );
    await page
      .getByRole('link', { name: 'Choose TNP Planner demo profile' })
      .click();
    await page.getByRole('button', { name: 'Enter as Riya Mehta' }).click();
    await page.waitForURL('**/planner');
    await page.getByRole('link', { name: 'Switch demo profile' }).waitFor();
    await page.goto(origin + '/operations', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Enter as Kavya Rao' }).click();
    await page
      .getByText('TNP OPERATIONS · SYNTHETIC WORKFORCE PREVIEW', {
        exact: true,
      })
      .waitFor();
    assert.deepEqual(errors, []);
    results.push({ width, pass: true, receipt, errors });
    await context.close();
  }
  await writeFile(
    `${evidence}/checkpoint-a-browser.json`,
    JSON.stringify(results, null, 2),
  );
  console.log(results);
} finally {
  await browser.close();
}
