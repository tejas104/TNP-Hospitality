import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  cubicBezier,
  GENIE_EASE,
  genieAxis,
  genieSliceCount,
  genieSlices,
  LAUNCHER_TIMING,
} from '../components/tnp/public/portal-launcher/motion.ts';

const read = (path) => readFileSync(resolve(path), 'utf8');
const win = { x: 440, y: 150, width: 560, height: 600 };
const dock = { x: 1376, y: 382, width: 48, height: 136 }; // right-middle tab
const header = { x: 300, y: 12, width: 80, height: 44 }; // mobile header

test('genie geometry is identity when settled and collapses into the source', () => {
  const n = genieSliceCount(win, genieAxis(win, dock));
  for (const { from, to } of genieSlices(win, dock, 0, n))
    for (const key of ['x', 'y', 'width', 'height'])
      assert.ok(Math.abs(from[key] - to[key]) < 1e-9, key);
  const closed = genieSlices(win, dock, 1, n);
  assert.ok(closed.every((slice) => slice.hidden));
  const centre = dock.x + dock.width / 2;
  assert.ok(closed.every(({ to }) => Math.abs(to.x - centre) < 1e-6));
});

test('mid-flight the window funnels toward its own source, not a fixed origin', () => {
  const n = genieSliceCount(win, genieAxis(win, dock));
  const mid = genieSlices(win, dock, 0.55, n).filter((s) => !s.hidden);
  const far = mid[0].to;
  const near = mid.at(-1).to;
  // Far edge stays wider than the source-facing edge (curved funnel).
  assert.ok(far.height > near.height * 1.5, `${far.height} vs ${near.height}`);
  // Source-facing strips converge on the dock's vertical centre.
  const dockMid = dock.y + dock.height / 2;
  assert.ok(Math.abs(near.y + near.height / 2 - dockMid) < 60);
  // A different source changes the axis and the direction of travel.
  assert.deepEqual(genieAxis(win, dock), { along: 'x', dir: 1 });
  assert.deepEqual(genieAxis(win, header), { along: 'y', dir: -1 });
  const top = genieSlices(win, header, 1, 30);
  const headerMid = header.y + header.height / 2;
  assert.ok(top.every(({ to }) => Math.abs(to.y - headerMid) < 1e-6));
});

test('genie timing and easing follow the requested ranges', () => {
  assert.equal(LAUNCHER_TIMING.open, 1440); // half-speed open per user
  assert.ok(LAUNCHER_TIMING.close >= 550 && LAUNCHER_TIMING.close <= 750);
  assert.deepEqual(GENIE_EASE.close, [0.7, 0, 0.84, 0]);
  assert.equal(cubicBezier(GENIE_EASE.open, 0), 0);
  assert.equal(cubicBezier(GENIE_EASE.open, 1), 1);
  assert.ok(Math.abs(cubicBezier([0, 0, 1, 1], 0.3) - 0.3) < 1e-3);
});

test('launcher dock escapes the transformed header and reuses GenieWindow', () => {
  const launcher = read(
    'components/tnp/public/portal-launcher/PortalLauncher.tsx',
  );
  const css = read(
    'components/tnp/public/portal-launcher/PortalLauncher.module.css',
  );
  assert.match(launcher, /createPortal\(trigger\('dock'\), host\)/);
  assert.match(launcher, /export function GenieWindow/);
  assert.match(css, /\.trigger \{\s*position: fixed;\s*right: 0;\s*top: 50%;/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  const freelancer = read(
    'components/tnp/portals/freelancer/FreelancerPortal.tsx',
  );
  assert.match(freelancer, /<GenieWindow[\s\S]*align="end"/);
  assert.match(freelancer, /not payable or withdrawable/);
  assert.doesNotMatch(freelancer, /workspaceTools/);
});

test('planner cards, admin quick actions, RSVP states and cursor stay wired', () => {
  const planner = read('components/tnp/portals/planner/PlannerEventStudio.tsx');
  assert.match(planner, /className=\{styles\.windowCard\}/);
  assert.match(planner, /role="alert"/);
  assert.doesNotMatch(planner, /alert\(/);
  const admin = read('components/tnp/portals/operations/AdminOperations.tsx');
  for (const id of ['overview', 'events', 'verification', 'finance'])
    assert.match(admin, new RegExp(`id: '${id}',\\s*label:`));
  assert.match(admin, /aria-pressed=\{panel === id\}/);
  const rsvp = read('components/tnp/portals/rsvp/RsvpWorkspace.tsx');
  assert.match(rsvp, /Prepare follow-up draft \(not sent\)/);
  assert.match(rsvp, /Public RSVP information/);
  const shell = read('components/tnp/AppShell.tsx');
  assert.doesNotMatch(shell, /CustomCursor/);
  assert.match(read('app/globals.css'), /html \{\s*cursor:\s*url\("data:image\/svg\+xml/);
});
