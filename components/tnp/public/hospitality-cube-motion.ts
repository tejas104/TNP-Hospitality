export const SERVICES = [
  'Venue',
  'Hire Workforce',
  'RSVP',
  'Hire Planner',
] as const;
export const QUARTER = Math.PI / 2;
// Faster autorotation per the 2026-09-21 user direction (was 4500/1500).
export const HOLD_MS = 2200;
export const TURN_MS = 900;
export const RESUME_MS = 6000;
const TAU = Math.PI * 2;

export function normalizeAngle(angle: number) {
  return Number.isFinite(angle) ? ((angle % TAU) + TAU) % TAU : 0;
}
export function serviceAt(angle: number) {
  return Math.round(normalizeAngle(angle) / QUARTER) % 4;
}
export function pointerIntent(dx: number, dy: number) {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return 'pending';
  return Math.abs(dx) > Math.abs(dy) * 1.25 ? 'horizontal' : 'vertical';
}
export function cubePolicy({
  reduced,
  mobile,
  saveData,
  cores,
  memory,
  failed,
  paused,
  visible,
  inView,
}: {
  reduced: boolean;
  mobile: boolean;
  saveData: boolean;
  cores?: number;
  memory?: number;
  failed: boolean;
  paused: boolean;
  visible: boolean;
  inView: boolean;
}) {
  const constrained =
    saveData ||
    (cores !== undefined && cores <= 2) ||
    (memory !== undefined && memory <= 2);
  const tier =
    reduced || constrained || failed ? 'static' : mobile ? 'mobile' : 'desktop';
  return {
    tier,
    animate: tier !== 'static' && !paused && visible && inView,
    dpr: tier === 'desktop' ? 1.5 : 1,
  } as const;
}
export type CubeMotion = {
  angle: number;
  from: number;
  to: number;
  elapsed: number;
  phase: 'hold' | 'turn' | 'inspect' | 'drag';
};
export function createMotion(): CubeMotion {
  return { angle: 0, from: 0, to: 0, elapsed: 0, phase: 'hold' };
}
export function beginDrag(state: CubeMotion): CubeMotion {
  return { ...state, phase: 'drag', elapsed: 0 };
}
export function dragTo(
  state: CubeMotion,
  startAngle: number,
  dx: number,
  width: number,
): CubeMotion {
  return {
    ...state,
    angle: startAngle - (dx / Math.max(1, width)) * Math.PI,
    phase: 'drag',
    elapsed: 0,
  };
}
export function endDrag(state: CubeMotion): CubeMotion {
  return { ...state, phase: 'inspect', elapsed: 0 };
}
export function selectService(
  state: CubeMotion,
  index: number,
  instant = false,
): CubeMotion {
  const target = ((Math.trunc(index) % 4) + 4) % 4;
  const distance = normalizeAngle(target * QUARTER - state.angle);
  if (instant || distance < 1e-8)
    return {
      ...state,
      angle: state.angle + distance,
      phase: 'inspect',
      elapsed: 0,
    };
  return {
    ...state,
    from: state.angle,
    to: state.angle + distance,
    phase: 'turn',
    elapsed: 0,
  };
}
// Time is supplied only while visible, on-screen and playing. Suspensions never
// consume the hold or inactivity interval; resumed frames cannot skip services.
export function advanceMotion(
  state: CubeMotion,
  deltaMs: number,
  running = true,
): CubeMotion {
  if (
    !running ||
    state.phase === 'drag' ||
    !Number.isFinite(deltaMs) ||
    deltaMs <= 0
  )
    return state;
  let next = { ...state };
  let remaining = Math.min(deltaMs, 1000);
  while (remaining > 0) {
    const duration =
      next.phase === 'turn'
        ? TURN_MS
        : next.phase === 'inspect'
          ? RESUME_MS
          : HOLD_MS;
    const step = Math.min(remaining, duration - next.elapsed);
    next.elapsed += step;
    remaining -= step;
    if (next.phase === 'turn') {
      const t = next.elapsed / TURN_MS;
      const eased = t * t * t * (t * (t * 6 - 15) + 10);
      next.angle = next.from + (next.to - next.from) * eased;
    }
    if (next.elapsed >= duration) {
      if (next.phase === 'turn') {
        next = { ...next, angle: next.to, phase: 'hold', elapsed: 0 };
      } else {
        // Advance to the next cardinal presentation from the exact inspected
        // orientation, never reset/snap it to an earlier face.
        const to = (Math.floor((next.angle + 1e-8) / QUARTER) + 1) * QUARTER;
        next = { ...next, from: next.angle, to, phase: 'turn', elapsed: 0 };
      }
    }
  }
  return next;
}
