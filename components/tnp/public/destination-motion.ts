import type { CSSProperties } from 'react';

export function destinationMode(
  animate: boolean,
  fine: boolean,
  native: boolean,
) {
  return !animate || !fine ? 'static' : native ? 'native' : 'fallback';
}

export function destinationProgress(
  top: number,
  height: number,
  viewport: number,
) {
  if (
    ![top, height, viewport].every(Number.isFinite) ||
    height <= 0 ||
    viewport <= 0
  )
    return 1;
  return Math.max(
    0,
    Math.min(1, (viewport * 0.85 - top) / (height + viewport * 0.45)),
  );
}

// Root-scroll ranges avoid an overflow ancestor accidentally becoming the
// timeline source. These are scroll offsets, never changes to scroll position.
export function destinationRange(top: number, viewport: number, index: number) {
  const start = Math.max(0, top - viewport * 0.94 + index * 14);
  return {
    start,
    end: Math.max(start + 1, top - viewport * 0.36 + index * 14),
  };
}

// Only the hero participates in the section-to-section continuity treatment.
export const heroSurface = {
  '--hero-surface': '#008080',
  '--hero-next': '#f5f1e7',
  '--hero-solid-stop': '85%',
} as CSSProperties;
