import test from 'node:test';
import assert from 'node:assert/strict';
import { productAudiences, publicNavigation } from './access-content.ts';
test('public navigation exposes six dedicated pages that retain homepage return links', () => {
  assert.deepEqual(
    publicNavigation.map((x) => x.href),
    ['/services', '/events', '/destinations', '/rsvp', '/people', '/about'],
  );
  assert.equal(new Set(publicNavigation.map((x) => x.href)).size, 6);
});
test('temporary client-demo audiences expose every existing workspace without Client authentication', () => {
  assert.deepEqual(
    productAudiences.map((x) => x.name),
    ['TNP Planner', 'Freelancer', 'Admin / Operations', 'RSVP'],
  );
  assert.deepEqual(
    productAudiences.map((x) => x.href),
    [
      '/login?workspace=tnp-planner',
      '/login?workspace=freelancer',
      '/login?workspace=operations',
      '/login?workspace=rsvp',
    ],
  );
  assert.ok(
    productAudiences.every(
      (x) => x.summary && x.detail && x.kind.startsWith('Synthetic'),
    ),
  );
  assert.ok(productAudiences.every((x) => !x.action.includes('Sign in')));
});
