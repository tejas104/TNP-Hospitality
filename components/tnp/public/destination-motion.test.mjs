import test from 'node:test';
import assert from 'node:assert/strict';
import {
  destinationMode,
  destinationProgress,
  destinationRange,
  homepageSurfaces,
  sectionSurface,
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
test('all major surfaces meet the next section continuously including both teal-to-ivory seams', () => {
  const surfaces = Object.values(homepageSurfaces);
  for (let i = 0; i < surfaces.length - 1; i++)
    assert.equal(surfaces[i][1], surfaces[i + 1][0]);
  assert.deepEqual(sectionSurface('hero'), {
    '--surface-current': '#062b29',
    '--surface-next': '#f5f1e7',
  });
  assert.equal(sectionSurface('rsvp')['--surface-next'], '#f5f1e7');
});
