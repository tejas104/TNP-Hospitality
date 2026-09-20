import test from 'node:test';
import assert from 'node:assert/strict';
import {
  workspaces,
  workspaceRegistry,
  routeInfo,
} from '../components/tnp/access/routes.ts';
import {
  demoProfiles,
  parseDemoSession,
} from '../components/tnp/access/session.ts';
import {
  productAudiences,
  accessAudiences,
} from '../components/tnp/public/access-content.ts';
import {
  sourceTransform,
  visibleSource,
  LAUNCHER_TIMING,
} from '../components/tnp/public/portal-launcher/motion.ts';
import {
  briefMessage,
  validateBrief,
} from '../components/tnp/public/enquiry-state.ts';

test('public catalogue is exactly Planner and Freelancer; Client cannot regain identity or route access', () => {
  for (const catalogue of [workspaces, productAudiences, accessAudiences])
    assert.deepEqual(
      catalogue.map((x) => x.id),
      ['tnp-planner', 'freelancer'],
    );
  assert.ok(workspaceRegistry.every((x) => x.id !== 'client'));
  assert.ok(demoProfiles.every((x) => x.workspace !== 'client'));
  assert.equal(
    parseDemoSession(
      JSON.stringify({
        version: 1,
        workspace: 'client',
        profileId: 'client-asha',
      }),
    ),
    null,
  );
  assert.equal(routeInfo('/client').surface, 'marketing');
  assert.equal(routeInfo('/operations').surface, 'workspace');
});
test('launcher geometry uses the exact current source and rejects invalid dimensions', () => {
  assert.equal(
    sourceTransform(
      { x: 10, y: 20, width: 44, height: 44 },
      { x: 100, y: 200, width: 440, height: 220 },
    ),
    'translate(-90px, -180px) scale(0.1, 0.2)',
  );
  assert.equal(
    sourceTransform(
      { x: 0, y: 0, width: 0, height: 44 },
      { x: 0, y: 0, width: 440, height: 220 },
    ),
    null,
  );
  assert.equal(
    visibleSource({ x: 10, y: -1, width: 44, height: 44 }, 320, 844),
    false,
  );
  assert.equal(
    visibleSource({ x: 277, y: 0, width: 44, height: 44 }, 320, 844),
    false,
  );
  assert.equal(
    visibleSource({ x: 10, y: 20, width: 44, height: 44 }, 320, 844),
    true,
  );
  assert.deepEqual(LAUNCHER_TIMING, { open: 420, close: 300 });
});
const brief = {
  mode: 'event',
  products: [],
  occasion: 'Sample celebration',
  city: 'Pune',
  date: '',
  guests: '',
  requester: 'A client I represent',
  billing: 'Sample buyer',
  ownVenue: true,
  ownPlanner: true,
  quantities: {},
};
test('mixed request permits no products, independent products and independent role quantities', () => {
  assert.deepEqual(validateBrief(brief), {});
  assert.match(
    briefMessage(brief, 'Please discuss options'),
    /Discuss with TNP/,
  );
  for (const products of [
    ['RSVP'],
    ['Venue'],
    ['Hospitality workforce', 'RSVP'],
  ]) {
    const value = {
      ...brief,
      products,
      quantities: { Hostess: '5', Porter: '2' },
    };
    assert.deepEqual(validateBrief(value), {});
    const message = briefMessage(value, 'Sample brief');
    assert.ok(message.includes(products.join(', ')));
    assert.match(message, /I already have a venue/);
    if (products.includes('Hospitality workforce')) {
      assert.match(message, /Hostess: 5/);
      assert.match(message, /Porter: 2/);
    }
  }
  assert.equal(
    briefMessage({ ...brief, mode: 'talk' }, 'Hello'),
    'General conversation\nHello',
  );
  assert.deepEqual(
    validateBrief({ ...brief, mode: 'talk', occasion: '', city: '' }),
    {},
  );
  assert.ok(validateBrief({ ...brief, guests: '-1' }).guests);
  assert.ok(
    validateBrief({
      ...brief,
      products: ['Hospitality workforce'],
      quantities: { Porter: '1.5' },
    }).quantities,
  );
});
