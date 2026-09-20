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
export const LAUNCHER_TIMING = { open: 420, close: 300 } as const;
