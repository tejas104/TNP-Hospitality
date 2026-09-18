export type WorkspaceState = 'closed' | 'hover' | 'pinned';
export function workspaceInteraction(
  state: WorkspaceState,
  action: 'enter' | 'leave' | 'toggle' | 'dismiss',
): WorkspaceState {
  if (action === 'dismiss') return 'closed';
  if (action === 'toggle') return state === 'closed' ? 'pinned' : 'closed';
  if (action === 'enter') return state === 'closed' ? 'hover' : state;
  return state === 'hover' ? 'closed' : state;
}
export function canPreviewService(
  pointer: string,
  fine: boolean,
  focusInside: boolean,
) {
  return pointer === 'mouse' && fine && !focusInside;
}
export function filmstripOffset(
  top: number,
  height: number,
  viewport: number,
  travel: number,
) {
  if (
    ![top, height, viewport, travel].every(Number.isFinite) ||
    height <= 0 ||
    viewport <= 0 ||
    travel <= 0
  )
    return 0;
  return (
    Math.max(
      0,
      Math.min(1, (viewport * 0.8 - top) / (height + viewport * 0.1)),
    ) * travel
  );
}
