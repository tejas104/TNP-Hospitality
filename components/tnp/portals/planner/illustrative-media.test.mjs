import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { plannerIllustration as slot } from './illustrative-media.ts';
test('planner contextual image is local and does not claim a real planner or venue identity', () => {
  assert.ok(
    existsSync(new URL('../../../../public' + slot.src, import.meta.url)),
  );
  assert.ok(slot.alt && slot.source && slot.position && slot.fallback);
  assert.match(slot.caption, /illustrative.*not a planner or booked venue/);
});
