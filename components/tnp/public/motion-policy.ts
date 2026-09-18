export function clampUnit(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
}

export function journeyProgress(top: number, height: number, viewport: number) {
  if (height <= 0 || viewport <= 0) return 0;
  return clampUnit((viewport * 0.85 - top) / (height + viewport * 0.3));
}

export function motionPolicy({
  reduced,
  mobile,
  finePointer,
  paused,
  visible,
}: {
  reduced: boolean;
  mobile: boolean;
  finePointer: boolean;
  paused: boolean;
  visible: boolean;
}) {
  const animate = !reduced && !paused && visible;
  return {
    animate,
    parallax: animate && !mobile && finePointer,
    scene: animate && !mobile,
  };
}
