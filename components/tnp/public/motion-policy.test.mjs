import test from 'node:test';
import assert from 'node:assert/strict';
import { clampUnit, journeyProgress, motionPolicy } from './motion-policy.ts';
const normal = {
  reduced: false,
  mobile: false,
  finePointer: true,
  paused: false,
  visible: true,
};
test('reduced motion, manual pause and hidden documents disable every motion layer', () => {
  for (const option of [
    { reduced: true },
    { paused: true },
    { visible: false },
  ])
    assert.deepEqual(motionPolicy({ ...normal, ...option }), {
      animate: false,
      parallax: false,
      scene: false,
    });
});
test('mobile never mounts the heavy scene and coarse pointers never parallax', () => {
  assert.deepEqual(motionPolicy({ ...normal, mobile: true }), {
    animate: true,
    parallax: false,
    scene: false,
  });
  assert.deepEqual(motionPolicy({ ...normal, finePointer: false }), {
    animate: true,
    parallax: false,
    scene: true,
  });
});
test('journey progress is bounded and follows normal scroll without jumps outside its range', () => {
  assert.equal(journeyProgress(1500, 400, 900), 0);
  assert.equal(journeyProgress(-900, 400, 900), 1);
  assert.ok(journeyProgress(300, 400, 900) > journeyProgress(500, 400, 900));
  for (const n of [NaN, Infinity, -Infinity]) assert.equal(clampUnit(n), 0);
  assert.equal(journeyProgress(0, 0, 900), 0);
});
