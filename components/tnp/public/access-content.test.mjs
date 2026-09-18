import test from 'node:test';
import assert from 'node:assert/strict';
import { accessAudiences, publicNavigation } from './access-content.ts';
test('public navigation exposes six real homepage destinations without internal Operations promotion', () => {
  assert.deepEqual(
    publicNavigation.map((x) => x.href),
    [
      '/#services',
      '/#events',
      '/#destinations',
      '/#rsvp',
      '/#people',
      '/#about',
    ],
  );
  assert.equal(new Set(publicNavigation.map((x) => x.href)).size, 6);
});
test('audience access actions are truthful previews or partner enquiry, never fake authentication', () => {
  assert.deepEqual(
    accessAudiences.map((x) => x.name),
    ['Client', 'Planner', 'Freelancer', 'RSVP Partner'],
  );
  assert.deepEqual(
    accessAudiences.map((x) => x.href),
    ['/client', '/planner', '/freelancer', '/contact?interest=vendor'],
  );
  assert.ok(
    accessAudiences.every(
      (x) => x.summary && x.detail && x.kind.startsWith('Synthetic'),
    ),
  );
  assert.ok(
    accessAudiences.every(
      (x) => !x.href.includes('admin') && !x.action.includes('Sign in'),
    ),
  );
});
