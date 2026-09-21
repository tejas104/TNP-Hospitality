export type Rect = { x: number; y: number; width: number; height: number };
export function sourceTransform(source: Rect, destination: Rect) {
  if (
    ![
      source.x,
      source.y,
      source.width,
      source.height,
      destination.x,
      destination.y,
      destination.width,
      destination.height,
    ].every(Number.isFinite) ||
    Math.min(
      source.width,
      source.height,
      destination.width,
      destination.height,
    ) <= 0
  )
    return null;
  return `translate(${source.x - destination.x}px, ${source.y - destination.y}px) scale(${source.width / destination.width}, ${source.height / destination.height})`;
}
export function visibleSource(rect: Rect, width: number, height: number) {
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    rect.x >= 0 &&
    rect.y >= 0 &&
    rect.x + rect.width <= width &&
    rect.y + rect.height <= height
  );
}
// Genie timing follows the user's 2026-09-21 direction: close 550–750ms, and
// the open was later halved in speed (720ms -> 1440ms) for the client demo.
export const LAUNCHER_TIMING = { open: 1440, close: 620 } as const;
export const GENIE_EASE = {
  // Slower start than (0.16,1,0.3,1) so the bend/stretch frames are seen.
  open: [0.4, 0.2, 0.2, 1],
  close: [0.7, 0, 0.84, 0],
} as const;

/** CSS cubic-bezier(x1, y1, x2, y2) evaluated at time t (Newton + bisection). */
export function cubicBezier(
  [x1, y1, x2, y2]: readonly number[],
  t: number,
) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const bez = (a: number, b: number, s: number) =>
    3 * a * s * (1 - s) ** 2 + 3 * b * s * s * (1 - s) + s ** 3;
  let lo = 0;
  let hi = 1;
  let s = t;
  for (let i = 0; i < 24; i++) {
    const x = bez(x1, x2, s);
    if (Math.abs(x - t) < 1e-5) break;
    if (x < t) lo = s;
    else hi = s;
    s = (lo + hi) / 2;
  }
  return bez(y1, y2, s);
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => (1 - Math.cos(Math.PI * clamp01(v))) / 2;

export type GenieAxis = { along: 'x' | 'y'; dir: 1 | -1 };
/** Which window edge faces the source: the source's dominant offset decides. */
export function genieAxis(win: Rect, src: Rect): GenieAxis {
  const dx = src.x + src.width / 2 - (win.x + win.width / 2);
  const dy = src.y + src.height / 2 - (win.y + win.height / 2);
  return Math.abs(dx) / win.width > Math.abs(dy) / win.height
    ? { along: 'x', dir: dx >= 0 ? 1 : -1 }
    : { along: 'y', dir: dy >= 0 ? 1 : -1 };
}
export function genieSliceCount(win: Rect, axis: GenieAxis) {
  const size = axis.along === 'x' ? win.width : win.height;
  return Math.max(18, Math.min(48, Math.round(size / 12)));
}

/**
 * Genie geometry. The window is cut into `n` strips perpendicular to the
 * source axis. p = 0 is the settled window, p = 1 is fully inside the source.
 * Phase 1 (bend) curves the side edges into a funnel toward the source; phase
 * 2 (slide) pours the strips through the funnel, so the far edge travels the
 * furthest and the source-facing edge disappears first. Returns each strip's
 * original and deformed rectangle in viewport coordinates.
 */
export function genieSlices(win: Rect, src: Rect, p: number, n: number) {
  const axis = genieAxis(win, src);
  const x = axis.along === 'x';
  const d = axis.dir;
  // Canonical frame: along axis increases toward the source.
  const a0 = d * (x ? (d > 0 ? win.x : win.x + win.width) : d > 0 ? win.y : win.y + win.height);
  const size = x ? win.width : win.height;
  const c0 = x ? win.y : win.x;
  const c1 = c0 + (x ? win.height : win.width);
  const sc = x ? src.y + src.height / 2 : src.x + src.width / 2;
  const sHalf = Math.max(2, (x ? src.height : src.width) / 2);
  const sA = Math.max(
    a0 + size,
    d * (x ? src.x + src.width / 2 : src.y + src.height / 2),
  );
  const travel = sA - a0;
  const bend = smooth(p / 0.45);
  const slide = smooth((p - 0.25) / 0.75);
  const move = (u: number) => Math.min(u + slide * travel, sA);
  const edges = (v: number) => {
    const s = smooth((v - a0) / travel) * bend;
    return [c0 + (sc - sHalf - c0) * s, c1 + (sc + sHalf - c1) * s];
  };
  const toReal = (a: number, b: number, lo: number, hi: number): Rect => {
    const r0 = Math.min(d * a, d * b);
    const r1 = Math.max(d * a, d * b);
    return x
      ? { x: r0, y: lo, width: r1 - r0, height: hi - lo }
      : { x: lo, y: r0, width: hi - lo, height: r1 - r0 };
  };
  const step = size / n;
  return Array.from({ length: n }, (_, i) => {
    const u0 = a0 + i * step;
    const u1 = u0 + step;
    const v0 = move(u0);
    const v1 = move(u1);
    const [lo, hi] = edges((v0 + v1) / 2);
    return {
      from: toReal(u0, u1, c0, c1),
      to: toReal(v0, v1, lo, hi),
      hidden: v1 - v0 < 0.05,
    };
  });
}
