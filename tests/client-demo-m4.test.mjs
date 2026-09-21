import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  demoWorkspaces,
  publicNavigation,
  routeInfo,
} from '../components/tnp/access/routes.ts';

test('all temporary demo roles resolve through one synthetic chooser and Client is absent', () => {
  assert.deepEqual(
    demoWorkspaces.map((item) => item.id),
    ['tnp-planner', 'freelancer', 'operations', 'rsvp'],
  );
  assert.ok(demoWorkspaces.every((item) => item.id !== 'client'));
  assert.equal(routeInfo('/rsvp').surface, 'marketing');
  assert.equal(routeInfo('/rsvp/workspace').surface, 'workspace');
  assert.equal(routeInfo('/operations').workspace, 'operations');
});

test('every public navbar destination has a real route entry', () => {
  for (const item of publicNavigation) {
    const page = resolve(`app${item.href}/page.tsx`);
    assert.equal(existsSync(page), true, `${item.label} is missing ${page}`);
  }
});

test('homepage accordion, floating-image labels and settled filmstrip contracts remain load-bearing', () => {
  const home = readFileSync(
    resolve('components/tnp/HomeExperience.tsx'),
    'utf8',
  );
  const hero = readFileSync(
    resolve('components/tnp/public/HomeHero.tsx'),
    'utf8',
  );
  const scene = readFileSync(
    resolve('components/tnp/public/PavilionScene.tsx'),
    'utf8',
  );
  const planner = readFileSync(
    resolve('components/tnp/portals/planner/PlannerPortal.tsx'),
    'utf8',
  );
  const plannerStudio = readFileSync(
    resolve('components/tnp/portals/planner/PlannerEventStudio.tsx'),
    'utf8',
  );
  const freelancer = readFileSync(
    resolve('components/tnp/portals/freelancer/FreelancerPortal.tsx'),
    'utf8',
  );
  const launcherMotion = readFileSync(
    resolve('components/tnp/public/portal-launcher/PortalLauncher.module.css'),
    'utf8',
  );
  assert.match(home, /className=\{styles\.servicePanel\}/);
  assert.match(home, /hidden=\{!open\}/);
  assert.doesNotMatch(hero, />\{index \+ 1\}</);
  assert.match(hero, /FLOATING STORIES/);
  assert.doesNotMatch(scene, /<boxGeometry args=\{\[2\.8, 2\.8, 2\.8\]\}/);
  assert.match(planner, /showPlannerApplication = false/);
  assert.match(planner, /showLegacyRequirementWorkflow = false/);
  assert.match(planner, /<PlannerEventStudio \/>/);
  assert.match(plannerStudio, /Create another event/);
  assert.match(plannerStudio, /Final submit event team/);
  assert.match(plannerStudio, /staffing: \[\]/);
  assert.match(freelancer, /freelancer-workspace-drawer/);
  assert.match(freelancer, /Sample wallet/);
  assert.match(launcherMotion, /@keyframes genieOpen/);
});
