// RSVP-local motion policy. Motion explains hierarchy and state; it never
// implies a server or provider action completed.

export type MotionEnv = { reduced: boolean; coarse: boolean; saveData: boolean };

export type MotionPolicy = {
  enabled: boolean;
  staggerMs: number;
  maxStaggered: number;
  travelPx: number;
  durations: { press: number; control: number; panel: number; editorial: number };
};

export function motionPolicy(env: MotionEnv): MotionPolicy {
  if (env.reduced) {
    // No spatial travel, stagger, parallax, shimmer or count-up: immediate or very short fades.
    return { enabled: false, staggerMs: 0, maxStaggered: 0, travelPx: 0, durations: { press: 0, control: 80, panel: 80, editorial: 80 } };
  }
  const light = env.coarse || env.saveData;
  return {
    enabled: true,
    staggerMs: light ? 30 : 40,
    maxStaggered: light ? 4 : 8,
    travelPx: light ? 8 : 14,
    durations: { press: 120, control: 190, panel: light ? 240 : 280, editorial: light ? 340 : 440 },
  };
}

/** Delay for the i-th item in a small visible group; items past the cap appear together. */
export function staggerDelay(index: number, policy: MotionPolicy) {
  if (!policy.enabled) return 0;
  return Math.min(index, policy.maxStaggered) * policy.staggerMs;
}

export function readMotionEnv(): MotionEnv {
  if (typeof window === 'undefined' || !window.matchMedia) return { reduced: true, coarse: false, saveData: false };
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  return {
    reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    coarse: window.matchMedia('(pointer: coarse)').matches,
    saveData: Boolean(nav.connection?.saveData),
  };
}
