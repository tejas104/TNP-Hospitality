import test from 'node:test';
import assert from 'node:assert/strict';
import { SERVICES, QUARTER, HOLD_MS, TURN_MS, RESUME_MS, normalizeAngle, serviceAt, pointerIntent, cubePolicy, createMotion, advanceMotion, beginDrag, dragTo, endDrag, selectService } from './hospitality-cube-motion.ts';
function advance(state, ms) { while (ms > 0) { const step = Math.min(ms, 100); state = advanceMotion(state, step); ms -= step; } return state; }
test('four services present for 4.5s and turn forward 90 degrees over 1.5s, including seamless wrap', () => {
  let state = createMotion();
  assert.deepEqual(SERVICES, ['Venue', 'Hire Workforce', 'RSVP', 'Hire Planner']);
  for (let i = 0; i < 8; i++) {
    assert.equal(serviceAt(state.angle), i % 4);
    const angle = state.angle;
    state = advance(state, HOLD_MS - 1);
    assert.equal(state.angle, angle);
    state = advance(state, 1 + TURN_MS / 2);
    assert.ok(Math.abs(state.angle - angle - QUARTER / 2) < 1e-9);
    state = advance(state, TURN_MS / 2);
    assert.ok(Math.abs(state.angle - angle - QUARTER) < 1e-9);
    assert.equal(state.phase, 'hold');
  }
});
test('normalization handles negative, wrapped and invalid angles', () => {
  assert.equal(serviceAt(-QUARTER), 3);
  assert.equal(serviceAt(8 * QUARTER), 0);
  assert.equal(normalizeAngle(NaN), 0);
  assert.equal(normalizeAngle(Infinity), 0);
  assert.ok(Math.abs(normalizeAngle(-0.2) - (2 * Math.PI - 0.2)) < 1e-9);
});
test('intent threshold preserves taps, vertical scrolling and diagonal gestures', () => {
  assert.equal(pointerIntent(7, 1), 'pending');
  assert.equal(pointerIntent(20, 5), 'horizontal');
  assert.equal(pointerIntent(-20, 5), 'horizontal');
  assert.equal(pointerIntent(4, 20), 'vertical');
  assert.equal(pointerIntent(20, 20), 'vertical');
});
test('drag interrupts turn and inactivity resumes continuously from inspected angle after six seconds', () => {
  let state = advance(createMotion(), HOLD_MS + 500);
  const angle = state.angle;
  state = dragTo(beginDrag(state), angle, 43, 400);
  const inspected = state.angle;
  assert.equal(advance(state, 10000).angle, inspected);
  state = advance(endDrag(state), RESUME_MS - 1);
  assert.equal(state.angle, inspected);
  state = advance(state, 1);
  assert.equal(state.angle, inspected);
  state = advance(state, 100);
  assert.ok(state.angle > inspected && state.angle - inspected < 0.02);
  state = advance(state, TURN_MS - 100);
  assert.ok(Math.abs(state.angle / QUARTER - Math.round(state.angle / QUARTER)) < 1e-9);
});
test('pause and suspension preserve exact partial-turn and inactivity state', () => {
  for (const state of [advance(createMotion(), HOLD_MS + 600), endDrag(createMotion())]) {
    assert.equal(advanceMotion(state, 60000, false), state);
    assert.equal(advanceMotion(state, NaN), state);
    assert.equal(advanceMotion(state, -1), state);
  }
});
test('keyboard selection takes forward path and static selection is immediate', () => {
  let state = selectService(createMotion(), 3);
  state = advance(state, TURN_MS);
  assert.equal(serviceAt(state.angle), 3);
  state = advance(selectService(state, 0), TURN_MS);
  assert.equal(state.angle, 4 * QUARTER);
  assert.equal(serviceAt(selectService(state, 2, true).angle), 2);
});
test('mobile is simplified; reduced motion, save-data, constrained hardware and failure are static', () => {
  const normal = { reduced: false, mobile: false, saveData: false, failed: false, paused: false, visible: true, inView: true };
  assert.deepEqual(cubePolicy(normal), { tier: 'desktop', animate: true, dpr: 1.5 });
  assert.deepEqual(cubePolicy({ ...normal, mobile: true }), { tier: 'mobile', animate: true, dpr: 1 });
  for (const option of [{ reduced: true }, { saveData: true }, { cores: 2 }, { memory: 2 }, { failed: true }]) {
    assert.equal(cubePolicy({ ...normal, ...option }).tier, 'static');
    assert.equal(cubePolicy({ ...normal, ...option }).animate, false);
  }
  for (const option of [{ paused: true }, { visible: false }, { inView: false }]) {
    assert.equal(cubePolicy({ ...normal, ...option }).animate, false);
    assert.equal(cubePolicy({ ...normal, ...option }).tier, 'desktop');
  }
});
