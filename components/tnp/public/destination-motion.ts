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

export const homepageSurfaces = {
  hero: ['#062b29', '#f5f1e7'],
  intro: ['#f5f1e7', '#f5f1e7'],
  services: ['#f5f1e7', '#083d36'],
  rsvp: ['#083d36', '#f5f1e7'],
  events: ['#f5f1e7', '#eae8dc'],
  destinations: ['#eae8dc', '#f5f1e7'],
  process: ['#f5f1e7', '#f5f1e7'],
  people: ['#f5f1e7', '#062b29'],
  final: ['#062b29', '#062b29'],
  footer: ['#062b29', '#062b29'],
} as const;

export function sectionSurface(
  section: keyof typeof homepageSurfaces,
): CSSProperties {
  const [current, next] = homepageSurfaces[section];
  return {
    '--surface-current': current,
    '--surface-next': next,
  } as CSSProperties;
}
