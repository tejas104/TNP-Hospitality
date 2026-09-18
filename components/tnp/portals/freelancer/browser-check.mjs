// Run against the reserved synthetic preview with an existing Playwright runtime:
// TNP_PLAYWRIGHT_MODULE=<absolute module index.mjs>, TNP_BROWSER_CDP=<CDP URL>
// node components/tnp/portals/freelancer/browser-check.mjs
// This test never writes repository fixtures or contacts production services.
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const { chromium } = await import(
  pathToFileURL(process.env.TNP_PLAYWRIGHT_MODULE).href
);
const browser = await chromium.connectOverCDP(process.env.TNP_BROWSER_CDP);
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  hasTouch: true,
});
const page = await context.newPage();
const problems = [];
page.on('pageerror', (e) => problems.push(e.message));
const checks = [];
const origin = 'http://127.0.0.1:3108';
async function check(name, fn) {
  await fn();
  checks.push(name);
  console.log(`PASS ${name}`);
}
async function key(locator, key = 'Enter') {
  await locator.press(key);
}
async function button(name) {
  await key(page.getByRole('button', { name, exact: true }));
}
async function nav(section) {
  await key(
    page
      .getByRole('navigation', { name: 'Freelancer workspace' })
      .getByRole('button', { name: new RegExp(section, 'i') }),
  );
}
async function ready() {
  await page.locator('#freelancer-profile').waitFor();
  await page
    .getByRole('button', { name: 'Refresh records', exact: true })
    .waitFor();
  await page.waitForFunction(
    () =>
      !!document.querySelector('#freelancer-content') &&
      !document.querySelector('[aria-busy="true"]') &&
      !document.querySelector('#freelancer-profile')?.disabled &&
      !Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Refresh records'),
      )?.disabled,
  );
}
async function profile(id) {
  await page.locator('#freelancer-profile').selectOption(id);
  await ready();
}
async function service(fn) {
  return page.evaluate(async (source) => {
    const { getBrowserPreviewService } =
      await import('/lib/services/preview.ts');
    const s = await getBrowserPreviewService();
    // Only literal test callbacks authored below enter this isolated browser context.
    // oxlint-disable-next-line typescript/no-implied-eval
    return await new Function('s', `return (${source})(s)`)(s);
  }, fn.toString());
}
async function refresh() {
  await button('Refresh records');
  await ready();
}
try {
  await page.goto(`${origin}/freelancer`);
  await ready();
  await check(
    'empty application validation and first-invalid keyboard focus',
    async () => {
      await button('Continue');
      await page.waitForFunction(
        () => document.activeElement?.id === 'sample-name',
      );
      assert.match(
        await page.getByRole('alert').innerText(),
        /Choose a sample display name/,
      );
      await page.keyboard.press('Tab');
      assert.equal(
        await page
          .locator('#sample-role')
          .evaluate((el) => el === document.activeElement),
        true,
      );
      await page.keyboard.press('Shift+Tab');
      assert.equal(
        await page
          .locator('#sample-name')
          .evaluate((el) => el === document.activeElement),
        true,
      );
    },
  );
  await check(
    'sample draft survives immediate reload and back navigation',
    async () => {
      await page.locator('#sample-name').selectOption('Sample Alex');
      await page.locator('#sample-role').selectOption('Volunteer');
      await button('Continue');
      await page.locator('#sample-experience').selectOption('Getting started');
      await page.reload();
      await ready();
      assert.equal(
        await page.locator('#sample-experience').inputValue(),
        'Getting started',
      );
      await button('Back');
      assert.equal(
        await page.locator('#sample-name').inputValue(),
        'Sample Alex',
      );
      await button('Continue');
    },
  );
  await check(
    'local storage failure keeps draft in memory across workspace navigation',
    async () => {
      await page.evaluate(() => {
        const original = Object.getOwnPropertyDescriptor(
          Storage.prototype,
          'setItem',
        ).value;
        window.__restoreStorage = () => {
          Storage.prototype.setItem = original;
        };
        Storage.prototype.setItem = function (k, v) {
          if (k.startsWith('tnp-freelancer-v1:draft'))
            throw new Error('Synthetic storage denial');
          return original.call(this, k, v);
        };
      });
      await page
        .locator('#sample-skills')
        .selectOption('Guest care and communication');
      assert.match(
        await page
          .locator('main output')
          .allTextContents()
          .then((x) => x.join(' ')),
        /Unsaved changes/,
      );
      await nav('opportunities');
      await nav('application');
      assert.equal(
        await page.locator('#sample-skills').inputValue(),
        'Guest care and communication',
      );
      await page.evaluate(() => window.__restoreStorage());
      await page.locator('#sample-availability').selectOption('Weekends');
    },
  );
  await check(
    'application and assessment persist independently without duplicate submission',
    async () => {
      await button('Continue');
      await page.locator('#question-0').check();
      await page.locator('input[name="question-1"][value="1"]').check();
      await page.locator('input[name="question-2"][value="2"]').check();
      await button('Continue');
      await button('Submit sample application');
      await page
        .getByRole('heading', {
          name: 'A good beginning. Your review is next.',
        })
        .waitFor();
      await button('Save sample assessment');
      await page.getByText('100% · passed', { exact: true }).waitFor();
      await page.reload();
      await ready();
      assert.equal(
        await page
          .getByRole('button', { name: 'Submit sample application' })
          .count(),
        0,
      );
      const records = await service(async (s) => ({
        apps: (await s.listApplications()).value.items.filter(
          (a) => a.applicantId === 'tnp-demo-freelancer-new',
        ),
        assessments: (await s.listAssessments('tnp-demo-freelancer-new')).value
          .items,
      }));
      assert.equal(records.apps.length, 1);
      assert.equal(records.apps[0].status, 'pending');
      assert.equal(records.assessments.length, 1);
    },
  );
  await check(
    'rejected and invalid application states stay distinct',
    async () => {
      await profile('tnp-demo-applicant-rejected');
      await page
        .getByRole('heading', { name: 'This application needs another look.' })
        .waitFor();
      await profile('tnp-demo-applicant-invalid');
      await page
        .getByRole('heading', { name: 'Your sample details need attention.' })
        .waitFor();
    },
  );
  await profile('tnp-demo-worker-006');
  await nav('opportunities');
  await check('filters, empty recovery and detail identity', async () => {
    const region = page.getByRole('region', {
      name: 'Opportunities with purpose.',
    });
    await region
      .getByRole('button', {
        name: 'View Event Coordinator at TNP Heritage Courtyard',
      })
      .click();
    assert.match(
      await page.getByLabel('Opportunity detail').innerText(),
      /tnp-demo-position-001/,
    );
    await region.getByRole('searchbox').fill('nonexistent');
    await page
      .getByRole('heading', { name: 'No roles match these filters.' })
      .waitFor();
    assert.equal(
      await page
        .getByRole('button', { name: 'Claim sample opportunity' })
        .count(),
      0,
    );
    await button('Clear filters');
    await key(
      region.getByRole('button', {
        name: 'View Volunteer at TNP Heritage Courtyard',
      }),
      'Space',
    );
    assert.match(
      await page.getByLabel('Opportunity detail').innerText(),
      /tnp-demo-position-002/,
    );
    assert.equal(
      await page
        .getByRole('button', { name: 'Profile not eligible' })
        .isDisabled(),
      true,
    );
    await button('Close role detail');
    assert.match(
      await page.evaluate(() =>
        document.activeElement?.getAttribute('aria-label'),
      ),
      /Volunteer/,
    );
    await key(
      region.getByRole('button', {
        name: 'View Hostess at TNP Heritage Courtyard',
      }),
    );
    assert.equal(
      await page
        .getByRole('button', { name: 'All sample positions filled' })
        .isDisabled(),
      true,
    );
    await key(
      region.getByRole('button', {
        name: 'View Security at TNP Heritage Courtyard',
      }),
    );
    assert.equal(
      await page
        .getByRole('button', { name: 'Currently unavailable' })
        .isDisabled(),
      true,
    );
  });
  await check(
    'claim response loss replays same request after refresh',
    async () => {
      await service(async (s) => {
        const original = s.mutate.bind(s);
        s.mutate = async (r) => {
          const result = await original(r);
          if (r.operation === 'claimOpportunity') {
            s.mutate = original;
            throw new Error('Synthetic lost response');
          }
          return result;
        };
      });
      await key(
        page.getByRole('button', {
          name: 'View Event Coordinator at TNP Heritage Courtyard',
        }),
      );
      await button('Claim sample opportunity');
      await page.getByText(/Synthetic lost response/).waitFor();
      await page.reload();
      await ready();
      await button('Retry same action');
      await page.getByText(/Recovered the same sample action/).waitFor();
      const assignments = await service(
        async (s) =>
          (await s.listAssignments('tnp-demo-worker-006')).value.items,
      );
      assert.equal(assignments.length, 1);
      assert.equal(assignments[0].response, 'pending');
      await nav('opportunities');
      await key(
        page.getByRole('button', {
          name: 'View Event Coordinator at TNP Heritage Courtyard',
        }),
      );
      assert.equal(
        await page
          .getByRole('button', { name: 'Claim sample opportunity' })
          .count(),
        0,
      );
    },
  );
  await check(
    'claim, Coming and Not Coming are separate with exact roster identity',
    async () => {
      await button('View your assignment');
      await button('Review assignment');
      assert.match(
        await page
          .locator('#assignment-detail-heading')
          .locator('..')
          .innerText(),
        /Response pending/,
      );
      await button('I’m coming');
      await ready();
      assert.equal(
        await page
          .getByRole('button', { name: 'I’m coming', exact: true })
          .isDisabled(),
        true,
      );
      await button('I’m not coming');
      await ready();
      const assignment = (
        await service(
          async (s) =>
            (await s.listAssignments('tnp-demo-worker-006')).value.items,
        )
      )[0];
      assert.equal(assignment.response, 'not-coming');
      await button('I’m coming');
      await ready();
      await profile('tnp-demo-worker-003');
      await nav('assignments');
      await button('Review assignment');
      assert.match(
        await page
          .locator('#assignment-detail-heading')
          .locator('..')
          .innerText(),
        /tnp-demo-assignment-003/,
      );
      assert.doesNotMatch(
        await page
          .locator('#assignment-detail-heading')
          .locator('..')
          .innerText(),
        new RegExp(assignment.id),
      );
      await page.reload();
      await ready();
      assert.equal(
        await page.locator('#freelancer-profile').inputValue(),
        'tnp-demo-worker-003',
      );
    },
  );
  await check(
    'derived Updates shows pending action without delivery claims',
    async () => {
      await profile('tnp-demo-worker-007');
      await nav('updates');
      assert.match(
        await page
          .getByRole('region', { name: 'What needs your attention.' })
          .innerText(),
        /RESPONSE NEEDED/,
      );
      assert.match(
        await page
          .getByRole('region', { name: 'What needs your attention.' })
          .innerText(),
        /not delivered notifications/,
      );
    },
  );
  await check('global loading, error, empty and ready recovery', async () => {
    for (const variant of ['loading', 'error', 'empty', 'ready']) {
      await page
        .getByRole('combobox', { name: 'Synthetic preview state' })
        .selectOption(variant);
      if (variant === 'loading')
        await page
          .getByRole('heading', { name: 'Sample loading state' })
          .waitFor();
      if (variant === 'error')
        await page
          .getByRole('heading', { name: 'The workspace could not be loaded.' })
          .waitFor();
      if (variant === 'empty')
        await page
          .getByRole('heading', { name: 'No sample records to show.' })
          .waitFor();
      if (variant === 'ready')
        await page
          .getByRole('heading', { name: 'What needs your attention.' })
          .waitFor();
    }
  });
  await check(
    'responsive overflow, keyboard, touch and reduced motion',
    async () => {
      await profile('tnp-demo-worker-006');
      await nav('opportunities');
      for (const width of [
        1440, 1100, 1001, 1000, 721, 720, 390, 360, 359, 320,
      ]) {
        await page.setViewportSize({ width, height: width < 721 ? 844 : 900 });
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
          `overflow at ${width}`,
        );
      }
      await page.setViewportSize({ width: 390, height: 844 });
      const view = page.getByRole('button', {
        name: 'View Event Coordinator at TNP Heritage Courtyard',
      });
      await view.evaluate((el) =>
        el.scrollIntoView({ block: 'center', behavior: 'instant' }),
      );
      await view.tap();
      await page.getByLabel('Opportunity detail').waitFor();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      assert.equal(
        await page
          .locator('main header')
          .evaluate((el) => getComputedStyle(el).animationName),
        'none',
      );
      await page.screenshot({
        path: join(tmpdir(), 'freelancer-final-mobile.png'),
        fullPage: true,
      });
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.screenshot({
        path: join(tmpdir(), 'freelancer-final-desktop.png'),
        fullPage: true,
      });
    },
  );
  await check('reset clears old application and retry scope', async () => {
    await button('Reset preview');
    await ready();
    await profile('tnp-demo-freelancer-new');
    await page.getByRole('heading', { name: 'Your introduction' }).waitFor();
    assert.equal(await page.locator('#sample-name').inputValue(), '');
    assert.equal(
      await page.getByRole('button', { name: 'Retry same action' }).count(),
      0,
    );
  });
  await check(
    'stale generation cannot apply an old assignment response',
    async () => {
      await profile('tnp-demo-worker-007');
      await nav('assignments');
      await button('Review assignment');
      await service(async (s) => {
        const original = s.mutate.bind(s);
        s.mutate = async (r) => {
          if (r.operation === 'respondToAssignment') {
            s.mutate = original;
            await s.resetPreview({
              requestKey: 'browser-stale-reset',
              actorId: 'test',
              expectedGeneration: r.expectedGeneration,
            });
          }
          return original(r);
        };
      });
      await button('I’m coming');
      await page.getByText(/The preview generation changed/).waitFor();
      await ready();
      assert.equal(
        (
          await service(
            async (s) =>
              (await s.listAssignments('tnp-demo-worker-007')).value.items,
          )
        )[0].response,
        'pending',
      );
      assert.equal(
        await page.getByRole('button', { name: 'Retry same action' }).count(),
        0,
      );
    },
  );
  await check(
    'overlap remains a service failure and preserves the original response',
    async () => {
      // A controlled browser-only synthetic fixture adds an overlapping assignment.
      // No application code or shared repository fixture is changed.
      await page.evaluate(() => {
        const envelope = JSON.parse(localStorage.getItem('tnp-preview-v1'));
        const original = envelope.records.assignments.find(
          (a) => a.id === 'tnp-demo-assignment-005',
        );
        original.response = 'not-coming';
        envelope.records.assignments.push({
          ...original,
          id: 'tnp-browser-overlap',
          response: 'coming',
        });
        localStorage.setItem('tnp-preview-v1', JSON.stringify(envelope));
      });
      await page.reload();
      await ready();
      await nav('assignments');
      await key(
        page
          .locator('article')
          .filter({ hasText: 'tnp-demo-assignment-005' })
          .getByRole('button', { name: 'Review assignment' }),
      );
      await button('I’m coming');
      await page.getByText(/OVERLAP:/).waitFor();
      const records = await service(
        async (s) =>
          (await s.listAssignments('tnp-demo-worker-007')).value.items,
      );
      assert.equal(
        records.find((a) => a.id === 'tnp-demo-assignment-005').response,
        'not-coming',
      );
      await button('Reset preview');
      await ready();
    },
  );
  await check(
    'replaced and cancelled allocations offer no reactivation controls',
    async () => {
      const replacement = await service(async (s) =>
        s.mutate({
          operation: 'replaceAssignment',
          actorId: 'tnp-demo-ops-001',
          expectedGeneration: await s.getGeneration(),
          requestKey: 'browser-replacement',
          payload: {
            assignmentId: 'tnp-demo-assignment-005',
            replacementWorkerId: 'tnp-demo-worker-006',
            reason: 'Synthetic inactive-state browser check',
          },
        }),
      );
      assert.equal(replacement.ok, true);
      await refresh();
      await button('Review assignment');
      assert.equal(
        await page
          .getByRole('button', { name: 'I’m coming', exact: true })
          .count(),
        0,
      );
      assert.match(
        await page
          .locator('#assignment-detail-heading')
          .locator('..')
          .innerText(),
        /assignment is replaced/,
      );
      await page.evaluate(() => {
        const e = JSON.parse(localStorage.getItem('tnp-preview-v1'));
        e.records.assignments.find(
          (a) => a.id === 'tnp-demo-assignment-005',
        ).allocationState = 'cancelled';
        localStorage.setItem('tnp-preview-v1', JSON.stringify(e));
      });
      await page.reload();
      await ready();
      await nav('assignments');
      await button('Review assignment');
      assert.match(
        await page
          .locator('#assignment-detail-heading')
          .locator('..')
          .innerText(),
        /assignment is cancelled/,
      );
      assert.equal(
        await page
          .getByRole('button', { name: 'I’m coming', exact: true })
          .count(),
        0,
      );
      await button('Reset preview');
      await ready();
    },
  );
  await check(
    'seeded workers cannot submit misleading profile changes or replay an old application draft',
    async () => {
      for (const id of [
        'tnp-demo-worker-003',
        'tnp-demo-worker-006',
        'tnp-demo-worker-007',
      ]) {
        await profile(id);
        await page
          .getByRole('heading', {
            name: 'Your worker profile is already on record.',
          })
          .waitFor();
        assert.equal(await page.locator('#sample-name').count(), 0);
        assert.equal(
          await page
            .getByRole('button', { name: 'Submit sample application' })
            .count(),
          0,
        );
        const before = await service(async (s) => ({
          workers: await Promise.all(
            [
              'tnp-demo-worker-003',
              'tnp-demo-worker-006',
              'tnp-demo-worker-007',
            ].map((id) => s.getStanding(id)),
          ),
          apps: await s.listApplications(),
        }));
        await page.evaluate((id) => {
          const envelope = JSON.parse(localStorage.getItem('tnp-preview-v1'));
          const request = {
            actorId: id,
            expectedGeneration: envelope.generation,
            requestKey: `old-application-${id}`,
            operation: 'registerApplicant',
            payload: {
              applicantId: id,
              displayName: 'Sample Alex',
              role: 'Volunteer',
            },
          };
          localStorage.setItem(
            `tnp-freelancer-v1:requests:${envelope.generation}:${id}`,
            JSON.stringify({ [`registerApplicant:${id}`]: request }),
          );
        }, id);
        await page.reload();
        await ready();
        await button('Retry same action');
        await page
          .getByText(/No new application or profile changes were submitted/)
          .waitFor();
        const after = await service(async (s) => ({
          workers: await Promise.all(
            [
              'tnp-demo-worker-003',
              'tnp-demo-worker-006',
              'tnp-demo-worker-007',
            ].map((id) => s.getStanding(id)),
          ),
          apps: await s.listApplications(),
        }));
        assert.deepEqual(after, before);
        assert.equal(
          await page.getByRole('button', { name: 'Retry same action' }).count(),
          0,
        );
        const current = before.workers.find((w) => w.value.id === id).value;
        assert.match(
          await page
            .getByRole('region', {
              name: 'Your worker profile is already on record.',
            })
            .innerText(),
          new RegExp(current.displayName),
        );
      }
    },
  );
  await check(
    'blocked local draft and retry storage use friendly in-memory fallback',
    async () => {
      const blocked = await browser.newContext({
        viewport: { width: 390, height: 844 },
      });
      try {
        await blocked.addInitScript(() => {
          const get = Object.getOwnPropertyDescriptor(
            Storage.prototype,
            'getItem',
          ).value;
          const set = Object.getOwnPropertyDescriptor(
            Storage.prototype,
            'setItem',
          ).value;
          Storage.prototype.getItem = function (k) {
            if (k.startsWith('tnp-freelancer-v1:'))
              throw new DOMException(
                'The operation is insecure.',
                'SecurityError',
              );
            return get.call(this, k);
          };
          Storage.prototype.setItem = function (k, v) {
            if (k.startsWith('tnp-freelancer-v1:'))
              throw new DOMException(
                'The operation is insecure.',
                'SecurityError',
              );
            return set.call(this, k, v);
          };
        });
        const p = await blocked.newPage();
        await p.goto(`${origin}/freelancer`);
        await p.locator('#sample-name').waitFor();
        assert.match(
          await p.locator('main').innerText(),
          /Saved draft unavailable. Your draft stays in memory/,
        );
        assert.match(
          await p.locator('main').innerText(),
          /New retry identities stay in memory/,
        );
        assert.doesNotMatch(
          await p.locator('main').innerText(),
          /operation is insecure/i,
        );
        await p.locator('#sample-name').selectOption('Sample Morgan');
        await p.locator('#sample-role').selectOption('Volunteer');
        await p
          .getByRole('button', { name: 'Continue', exact: true })
          .press('Enter');
        await p.locator('#sample-experience').selectOption('Getting started');
        const navigation = p.getByRole('navigation', {
          name: 'Freelancer workspace',
        });
        await navigation
          .getByRole('button', { name: /Opportunities/i })
          .press('Enter');
        await navigation
          .getByRole('button', { name: /Application/i })
          .press('Enter');
        assert.equal(
          await p.locator('#sample-experience').inputValue(),
          'Getting started',
        );
        assert.match(
          await p.locator('main').innerText(),
          /Draft stays in memory/,
        );
      } finally {
        await blocked.close();
      }
    },
  );
  await check(
    'small application labels filters and navigation numerals meet 4.5 to 1 contrast',
    async () => {
      await profile('tnp-demo-freelancer-new');
      async function ratios(selector) {
        return page.locator(selector).evaluateAll((elements) => {
          const rgb = (text) => text.match(/[\d.]+/g).map(Number);
          const luminance = (channels) =>
            channels
              .slice(0, 3)
              .map((c) => {
                c /= 255;
                return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
              })
              .reduce((v, c, i) => v + c * [0.2126, 0.7152, 0.0722][i], 0);
          return elements
            .filter((el) => el.checkVisibility())
            .map((el) => {
              let parent = el;
              let bg;
              while (parent) {
                const value = rgb(getComputedStyle(parent).backgroundColor);
                if (value.length === 3 || value[3] > 0) {
                  bg = value;
                  break;
                }
                parent = parent.parentElement;
              }
              const foreground = luminance(rgb(getComputedStyle(el).color));
              const background = luminance(bg ?? [255, 255, 255]);
              return {
                text: el.textContent.trim().slice(0, 45),
                ratio:
                  (Math.max(foreground, background) + 0.05) /
                  (Math.min(foreground, background) + 0.05),
              };
            });
        });
      }
      const application = await ratios(
        'main label, nav[aria-label="Freelancer workspace"] button > span',
      );
      await nav('opportunities');
      const filters = await ratios(
        'main label, nav[aria-label="Freelancer workspace"] button > span',
      );
      for (const result of [...application, ...filters])
        assert.ok(result.ratio >= 4.5, `${result.text}: ${result.ratio}`);
      console.log(
        'Contrast measurements:',
        JSON.stringify([...application, ...filters]),
      );
    },
  );
  assert.deepEqual(problems, []);
  console.log(
    JSON.stringify(
      { status: 'PASS', checks, browserErrors: problems },
      null,
      2,
    ),
  );
} finally {
  await context.close();
  await browser.close();
}
