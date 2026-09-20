// Run against the owned local preview. Playwright is supplied externally so no
// application package/lockfile changes are necessary.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(
  pathToFileURL(process.env.TNP_PLAYWRIGHT_MODULE).href
);
const origin = process.env.TNP_TEST_ORIGIN ?? 'http://127.0.0.1:3118';
const evidence = process.env.TNP_EVIDENCE_DIR ?? 'work/browser';
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await context.newPage();
const errors = [];
const results = [];
context.on('page', (tab) =>
  tab.on('pageerror', (error) => errors.push(error.message)),
);
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => {
  if (
    message.type() === 'error' &&
    !message.text().includes('Failed to load resource')
  )
    errors.push(message.text());
});
async function check(name, fn) {
  await fn();
  results.push(name);
  console.log(`PASS ${name}`);
}
async function ready() {
  await page.locator('h1').first().waitFor();
  await page.evaluate(() => document.fonts.ready);
}
async function noOverflow() {
  const bad = await page.evaluate(() =>
    [...document.querySelectorAll('body *')]
      .filter((el) => {
        const style = getComputedStyle(el),
          r = el.getBoundingClientRect();
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          r.width > 0 &&
          r.height > 0 &&
          (r.right > innerWidth + 2 || r.left < -2) &&
          !el.closest('.public-skip, .custom-cursor, [hidden], [inert]')
        );
      })
      .map((el) => ({
        tag: el.tagName,
        class: el.className,
        text: el.textContent.slice(0, 70),
      }))
      .slice(0, 8),
  );
  assert.deepEqual(bad, []);
}
try {
  await check(
    'direct workspace entry returns to allowlisted chooser',
    async () => {
      await page.goto(`${origin}/client`);
      await page.waitForURL('**/login?workspace=client');
      await ready();
      assert.equal(await page.locator('#workspace-content').count(), 0);
    },
  );
  await check(
    'explicit selection, refresh persistence, canonical Operations alias',
    async () => {
      await page
        .getByRole('button', { name: 'Enter as Asha Shah', exact: true })
        .click();
      await page.waitForURL('**/client');
      await page.locator('#workspace-content').waitFor();
      await page.reload();
      await page.locator('#workspace-content').waitFor();
      assert.match(
        await page.locator('.ux-orientation').innerText(),
        /Asha Shah/,
      );
      await page.goto(`${origin}/admin`);
      await page.waitForURL('**/login?workspace=operations');
      await page
        .getByRole('button', { name: 'Enter as Kavya Rao', exact: true })
        .click();
      await page.waitForURL('**/operations');
      await page.locator('#workspace-content').waitFor();
      await page.goto(`${origin}/admin`);
      await page.waitForURL('**/operations');
    },
  );
  await check(
    'switcher does not hover-open; Space, Escape, focus return and outside dismissal',
    async () => {
      const trigger = page.getByRole('button', {
        name: 'Operations workspace',
      });
      await trigger.hover();
      assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
      await trigger.focus();
      await page.keyboard.press('Space');
      assert.equal(await trigger.getAttribute('aria-expanded'), 'true');
      assert.equal(await page.locator('#workspace-menu a').count(), 5);
      await page.keyboard.press('Tab');
      assert.equal(
        await page
          .locator('#workspace-menu a')
          .first()
          .evaluate((el) => el === document.activeElement),
        true,
      );
      await page.keyboard.press('Escape');
      assert.equal(
        await trigger.evaluate((el) => el === document.activeElement),
        true,
      );
      await trigger.click();
      await page.locator('.ux-orientation h2').click();
      assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
    },
  );
  await check(
    'profile switch and exit preserve connected records, blocked profile cannot open feature',
    async () => {
      await page.evaluate(() =>
        localStorage.setItem('ux-browser-record-sentinel', 'kept'),
      );
      await page
        .getByRole('link', { name: 'Switch demo profile', exact: true })
        .click();
      await page
        .getByRole('button', { name: 'Preview forbidden access', exact: true })
        .click();
      assert.match(
        await page.locator('output').innerText(),
        /access forbidden/,
      );
      await page.goto(`${origin}/operations`);
      await page.waitForURL('**/login?workspace=operations');
      assert.equal(await page.locator('#workspace-content').count(), 0);
      await page
        .getByRole('button', { name: 'Exit demo', exact: true })
        .click();
      await page.waitForURL('**/login');
      assert.equal(
        await page.evaluate(() =>
          sessionStorage.getItem('tnp-demo-session-v1'),
        ),
        null,
      );
      assert.equal(
        await page.evaluate(() =>
          localStorage.getItem('ux-browser-record-sentinel'),
        ),
        'kept',
      );
    },
  );
  await check(
    'two tabs isolate shell identity and profile switching',
    async () => {
      await page.goto(`${origin}/login?workspace=client`);
      await page
        .getByRole('button', { name: 'Enter as Asha Shah', exact: true })
        .click();
      await page.waitForURL('**/client');
      const second = await context.newPage();
      await second.goto(`${origin}/client`);
      await second.waitForURL('**/login?workspace=client');
      await second
        .getByRole('button', { name: 'Enter as Mira Rao', exact: true })
        .click();
      await second.waitForURL('**/client');
      assert.equal(
        await page.evaluate(
          () =>
            JSON.parse(sessionStorage.getItem('tnp-demo-session-v1')).profileId,
        ),
        'client-asha',
      );
      assert.equal(
        await second.evaluate(
          () =>
            JSON.parse(sessionStorage.getItem('tnp-demo-session-v1')).profileId,
        ),
        'client-representative',
      );
      await second.close();
    },
  );
  await check(
    'Back/Forward preserves identity; skip link transfers focus',
    async () => {
      await page
        .getByRole('link', { name: 'Switch demo profile', exact: true })
        .click();
      await page.waitForURL('**/login?workspace=client');
      await page.goBack();
      await page.waitForURL('**/client');
      await page.locator('#workspace-content').waitFor();
      await page.goForward();
      await page.waitForURL('**/login?workspace=client');
      await page.getByRole('link', { name: 'Skip to main content' }).focus();
      await page.keyboard.press('Enter');
      assert.equal(
        await page
          .locator('#main-content')
          .evaluate((el) => el === document.activeElement),
        true,
      );
    },
  );
  for (const [width, height] of [
    [1440, 900],
    [1100, 900],
    [390, 844],
    [320, 844],
  ]) {
    await check(
      `access and workspace chrome ${width}x${height}: overflow, menu clearance and screenshot`,
      async () => {
        await page.setViewportSize({ width, height });
        await page.goto(`${origin}/login`);
        await ready();
        await noOverflow();
        await page.screenshot({
          path: `${evidence}/access-${width}.png`,
          fullPage: true,
        });
        await page.getByRole('button', { name: 'Switch workspace' }).click();
        await noOverflow();
        await page.screenshot({
          path: `${evidence}/switcher-${width}.png`,
          fullPage: true,
        });
        await page.keyboard.press('Escape');
        await page.goto(`${origin}/client`);
        await page.locator('#workspace-content').waitFor();
        assert.equal(await page.locator('.portal-switcher').count(), 0);
        assert.equal(await page.locator('.custom-cursor').count(), 0);
        await page.locator('.ux-preview-tools summary').click();
        const tools = await page.locator('.ux-preview-tools').boundingBox(),
          content = await page.locator('#workspace-content').boundingBox();
        assert.ok(tools.y + tools.height <= content.y + 1);
        await page.screenshot({
          path: `${evidence}/client-chrome-${width}.png`,
        });
        // Frozen feature layout has separate ownership; assert shared chrome only.
        const sharedOverflow = await page
          .locator('.ux-header, .ux-orientation, .ux-preview-tools')
          .evaluateAll((nodes) =>
            nodes.some(
              (el) => el.getBoundingClientRect().right > innerWidth + 1,
            ),
          );
        assert.equal(sharedOverflow, false);
      },
    );
  }
  await check(
    'all installed workspace destinations resolve; RSVP remains truthful access-only',
    async () => {
      for (const [id, name, route] of [
        ['tnp-planner', 'Riya Mehta', 'planner'],
        ['freelancer', 'Neha Joshi', 'freelancer'],
        ['operations', 'Kavya Rao', 'operations'],
      ]) {
        await page.goto(`${origin}/login?workspace=${id}`);
        await page
          .getByRole('button', { name: `Enter as ${name}`, exact: true })
          .click();
        await page.waitForURL(`**/${route}`);
        await page.locator('#workspace-content').waitFor();
        assert.equal(await page.locator('.custom-cursor').count(), 0);
      }
      await page.goto(`${origin}/login?workspace=rsvp`);
      await page
        .getByRole('button', { name: 'Preview active access', exact: true })
        .click();
      assert.match(await page.locator('output').innerText(), /adapter pending/);
    },
  );
  await check(
    'cross-portal reset is explicit, cancellable and keeps shell identity',
    async () => {
      await page.goto(`${origin}/login?workspace=operations`);
      await page
        .getByRole('button', { name: 'Enter as Kavya Rao', exact: true })
        .click();
      await page.waitForURL('**/operations');
      await page.locator('.ux-preview-tools summary').click();
      const reset = page.getByRole('button', {
        name: 'Reset connected cross-portal preview',
        exact: true,
      });
      await reset.click();
      await page
        .getByRole('button', { name: 'Keep preview records', exact: true })
        .click();
      assert.equal(
        await reset.evaluate((el) => el === document.activeElement),
        true,
      );
      await reset.click();
      await page
        .getByRole('button', {
          name: 'Confirm cross-portal reset',
          exact: true,
        })
        .click();
      await page.waitForFunction(() =>
        document
          .querySelector('.preview-control-panel output')
          ?.textContent?.includes('Preview reset to generation'),
      );
      assert.equal(
        await page.evaluate(
          () =>
            JSON.parse(sessionStorage.getItem('tnp-demo-session-v1')).profileId,
        ),
        'operations-reviewer',
      );
    },
  );
  await check(
    'denied sessionStorage falls back to memory across navigation and exits',
    async () => {
      const denied = await browser.newContext({
        viewport: { width: 390, height: 844 },
      });
      await denied.addInitScript(() =>
        Object.defineProperty(window, 'sessionStorage', {
          get() {
            throw new DOMException('Denied', 'SecurityError');
          },
        }),
      );
      const tab = await denied.newPage();
      tab.on('pageerror', (e) => errors.push(e.message));
      await tab.goto(`${origin}/login?workspace=client`);
      await tab
        .getByRole('button', { name: 'Enter as Asha Shah', exact: true })
        .click();
      await tab.waitForURL('**/client');
      await tab.locator('#workspace-content').waitFor();
      assert.match(
        await tab.locator('output.ux-storage-warning').innerText(),
        /held in memory/,
      );
      await tab
        .getByRole('link', { name: 'Switch demo profile', exact: true })
        .click();
      await tab
        .getByRole('button', { name: 'Enter as Mira Rao', exact: true })
        .click();
      await tab.waitForURL('**/client');
      assert.match(
        await tab.locator('.ux-orientation').innerText(),
        /Mira Rao/,
      );
      await tab.getByRole('button', { name: 'Exit demo', exact: true }).click();
      await tab.waitForURL('**/login?workspace=client');
      await tab.screenshot({
        path: `${evidence}/storage-denied.png`,
        fullPage: true,
      });
      await denied.close();
    },
  );
  await check(
    'home-only cursor cleans up on navigation and respects reduced motion/coarse pointer',
    async () => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`${origin}/`);
      await page.waitForFunction(() =>
        document.body.classList.contains('has-custom-cursor'),
      );
      await page.getByRole('link', { name: 'Workspaces', exact: true }).click();
      await page.waitForURL('**/login');
      assert.equal(
        await page.evaluate(() =>
          document.body.classList.contains('has-custom-cursor'),
        ),
        false,
      );
      await page.goBack();
      await page.waitForURL(`${origin}/`);
      await page.waitForFunction(() =>
        document.body.classList.contains('has-custom-cursor'),
      );
      const touch = await browser.newContext({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        reducedMotion: 'reduce',
      });
      const tab = await touch.newPage();
      await tab.goto(`${origin}/`);
      await tab.locator('h1').first().waitFor();
      assert.equal(
        await tab.evaluate(() =>
          document.body.classList.contains('has-custom-cursor'),
        ),
        false,
      );
      await tab.goto(`${origin}/login`);
      await tab.getByRole('button', { name: 'Switch workspace' }).tap();
      await tab.locator('#workspace-menu').waitFor({ state: 'visible' });
      await tab.screenshot({
        path: `${evidence}/touch-reduced-motion.png`,
        fullPage: true,
      });
      await touch.close();
    },
  );
  await check(
    'mandatory synthetic-data warning stays visible while controls remain collapsed at desktop, mobile and 200% zoom',
    async () => {
      for (const [width, height, zoom] of [
        [1440, 900, 1],
        [390, 844, 1],
        [1440, 900, 2],
      ]) {
        await page.setViewportSize({ width, height });
        await page.goto(`${origin}/login?workspace=client`);
        await page
          .getByRole('button', { name: 'Enter as Asha Shah', exact: true })
          .click();
        await page.waitForURL('**/client');
        await page.locator('#workspace-content').waitFor();
        await page.locator('.ux-preview-warning').waitFor({ state: 'visible' });
        await page.locator('.ux-preview-tools summary').waitFor();
        if (zoom === 2)
          await page.evaluate(
            () => (document.documentElement.style.zoom = '2'),
          );
        const warning = page.locator('.ux-preview-warning');
        assert.equal(
          (await warning.innerText()).trim(),
          'Synthetic preview data. Do not enter real personal information. No live verification, tracking or payments.',
        );
        assert.equal(await warning.getAttribute('role'), 'note');
        assert.equal(await page.locator('.ux-preview-warning').count(), 1);
        assert.equal(
          await page.locator('.ux-preview-tools').evaluate((el) => el.open),
          false,
        );
        assert.equal(
          await page.getByLabel('Synthetic preview state').isVisible(),
          false,
        );
        assert.equal(
          await page
            .getByRole('button', {
              name: 'Reset connected cross-portal preview',
              exact: true,
            })
            .isVisible(),
          false,
        );
        const geometry = await warning.evaluate((el) => {
          const rect = el.getBoundingClientRect();
          return {
            right: rect.right,
            left: rect.left,
            bottom: rect.bottom,
            nextTop: el.nextElementSibling.getBoundingClientRect().top,
            position: getComputedStyle(el).position,
            viewport: innerWidth,
          };
        });
        assert.equal(geometry.position, 'static');
        assert.ok(
          geometry.left >= -1 && geometry.right <= geometry.viewport + 1,
        );
        assert.ok(geometry.bottom <= geometry.nextTop + 1);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth + 1,
          ),
          false,
        );
        await page.screenshot({
          path: `${evidence}/preview-warning-${width}-zoom-${zoom}x.png`,
        });
        if (zoom === 2)
          await page.evaluate(() => (document.documentElement.style.zoom = ''));
      }
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`${origin}/login?workspace=client`);
      await page
        .getByRole('button', { name: 'Enter as Asha Shah', exact: true })
        .click();
      await page.waitForURL('**/client');
      const summary = page.locator('.ux-preview-tools summary');
      await summary.focus();
      await page.keyboard.press('Enter');
      assert.equal(
        await page.locator('.ux-preview-tools').evaluate((el) => el.open),
        true,
      );
      await page.locator('.ux-preview-tools summary').press('Space');
      assert.equal(
        await page.locator('.ux-preview-tools').evaluate((el) => el.open),
        false,
      );
      await page.emulateMedia({ reducedMotion: 'reduce' });
      assert.equal(await page.locator('.ux-preview-warning').isVisible(), true);
      await page.emulateMedia({ reducedMotion: 'no-preference' });
    },
  );
  await check(
    '200% layout zoom reflow and forced-colors shared focus',
    async () => {
      await page.goto(`${origin}/login`);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.locator('.ux-workspace-pill:not(:disabled)').waitFor();
      await page.evaluate(() => (document.documentElement.style.zoom = '2'));
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      );
      assert.equal(overflow, false);
      await page.screenshot({
        path: `${evidence}/zoom-200.png`,
        fullPage: true,
      });
      await page.evaluate(() => (document.documentElement.style.zoom = ''));
      await page.emulateMedia({
        forcedColors: 'active',
        reducedMotion: 'reduce',
      });
      await page.getByRole('button', { name: 'Switch workspace' }).focus();
      assert.notEqual(
        await page
          .getByRole('button', { name: 'Switch workspace' })
          .evaluate((el) => getComputedStyle(el).outlineStyle),
        'none',
      );
      await page.emulateMedia({
        forcedColors: 'none',
        reducedMotion: 'no-preference',
      });
    },
  );
  await check(
    'PartnerCard matrix: evidence, missing images, selection, loading, unavailable, retry and empty',
    async () => {
      await page.goto(`${origin}/tests/ux-components.html`);
      await page
        .getByRole('heading', { name: 'Component verification fixtures' })
        .waitFor();
      await page
        .getByRole('button', { name: 'Choose test venue', exact: true })
        .click();
      assert.equal(
        await page
          .getByRole('button', { name: 'Selected · Choose test venue' })
          .getAttribute('aria-pressed'),
        'true',
      );
      assert.equal(
        await page
          .getByRole('button', { name: 'Choose planner', exact: true })
          .isDisabled(),
        true,
      );
      assert.equal(
        await page
          .getByRole('button', { name: 'Choose loading fixture', exact: true })
          .isDisabled(),
        true,
      );
      await page
        .getByRole('button', { name: 'Retry partner evidence' })
        .click();
      assert.match(await page.locator('output').innerText(), /Retry count: 1/);
      assert.equal(
        await page.getByText('Verified rating', { exact: true }).count(),
        1,
      );
      assert.ok(
        (await page.getByText('Image unavailable', { exact: true }).count()) >=
          4,
      );
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        await noOverflow();
        await page.screenshot({
          path: `${evidence}/partner-states-${width}.png`,
          fullPage: true,
        });
      }
    },
  );
  assert.deepEqual(errors, []);
  await writeFile(
    `${evidence}/results.json`,
    JSON.stringify(
      {
        origin,
        browser: await browser.version(),
        results,
        errors,
        limitations: [
          'CSS 200% zoom/reflow, not a physical browser toolbar zoom measurement.',
          'Chromium/Edge desktop and mobile emulation; no physical Android/iOS device claim.',
          'RSVP feature routes absent by launch design; guest/event surface behavior is unit-tested at adapter boundary.',
        ],
      },
      null,
      2,
    ),
  );
  console.log(
    `PASS ${results.length} browser scenarios, no runtime/hydration errors`,
  );
} catch (error) {
  await page.screenshot({ path: `${evidence}/failure.png`, fullPage: true });
  await writeFile(
    `${evidence}/failure.json`,
    JSON.stringify({ results, errors, error: String(error) }, null, 2),
  );
  throw error;
} finally {
  await browser.close();
}
