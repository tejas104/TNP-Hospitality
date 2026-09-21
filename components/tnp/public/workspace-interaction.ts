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
  // Hold the first frame until the complete strip is inside the comfortable
  // viewport band. The previous 80vh trigger moved the images while the user
  // was still arriving at the first photograph.
  const settledTop = Math.max(viewport * 0.08, viewport * 0.92 - height);
  const progress = (settledTop - top) / (height + viewport * 0.35);
  return Math.max(0, Math.min(1, progress)) * travel;
}
