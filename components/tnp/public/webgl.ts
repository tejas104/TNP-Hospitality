// Probe before mounting R3F: Canvas's fallback does not catch async renderer setup.
// Three r185 requires WebGL2; a WebGL1-only browser must keep the still artwork.
export function probeWebGL2(
  createCanvas: () => HTMLCanvasElement = () =>
    document.createElement('canvas'),
): boolean {
  try {
    const context = createCanvas().getContext('webgl2', {
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });
    if (!context) return false;
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}
