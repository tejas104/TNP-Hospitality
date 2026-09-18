import test from 'node:test';
import assert from 'node:assert/strict';
import {
  destinationMode,
  destinationProgress,
  destinationRange,
  heroSurface,
} from './destination-motion.ts';
test('destination enhancement is static for touch or disabled motion and preserves unsupported fallback', () => {
  assert.equal(destinationMode(true, true, true), 'native');
  assert.equal(destinationMode(true, true, false), 'fallback');
  assert.equal(destinationMode(false, true, true), 'static');
  assert.equal(destinationMode(true, false, true), 'static');
});
test('itinerary progress is bounded and completes without hiding content for malformed measurements', () => {
  assert.equal(destinationProgress(2000, 700, 900), 0);
  assert.equal(destinationProgress(-2000, 700, 900), 1);
  assert.ok(
    destinationProgress(0, 700, 900) > destinationProgress(500, 700, 900),
  );
  for (const v of [NaN, Infinity, -Infinity])
    assert.equal(destinationProgress(v, 700, 900), 1);
});
test('six image entry ranges are staggered, positive, finite and settle before leaving view', () => {
  for (let i = 0; i < 6; i++) {
    const r = destinationRange(5000, 900, i);
    assert.ok(r.start >= 0 && r.end > r.start && r.end < 5000);
    if (i) assert.ok(r.start > destinationRange(5000, 900, i - 1).start);
  }
});
test('hero alone reserves the final 15 percent for teal-to-ivory continuity', () => {
  assert.deepEqual(heroSurface, {
    '--hero-surface': '#062b29',
    '--hero-next': '#f5f1e7',
    '--hero-solid-stop': '85%',
  });
});
