/**
 * Shared canvas rendering utilities. Used by PreviewManager (web worker)
 * and ImageViewer (main thread).
 */

/**
 * Compute letterbox / fit parameters: fit a graphic of size (gw × gh) into a
 * canvas of size (cw × ch), preserving aspect ratio, centered.
 * The blank bars should be filled by the caller (usually black or a pattern).
 */
export function computeLetterbox(
  cw: number,
  ch: number,
  gw: number,
  gh: number,
): { dx: number; dy: number; dw: number; dh: number } {
  const scale = Math.min(cw / gw, ch / gh);
  const dw = Math.round(gw * scale);
  const dh = Math.round(gh * scale);
  const dx = Math.round((cw - dw) / 2);
  const dy = Math.round((ch - dh) / 2);
  return { dx, dy, dw, dh };
}

/**
 * Return the scale factor that fits a graphic of size (gw × gh) into a canvas
 * of size (cw × ch) while preserving aspect ratio.
 */
export function computeFitScale(
  cw: number,
  ch: number,
  gw: number,
  gh: number,
): number {
  return Math.min(cw / gw, ch / gh);
}
