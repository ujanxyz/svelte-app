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

/**
 * Creates an ImageData object from a Blob (e.g. from a media asset).
 *
 * @param blob The Blob representing the image data.
 * @returns A Promise that resolves to an ImageData object.
 */
export async function makeImageDataFromBlob(blob: Blob): Promise<ImageData> {
  const bitmap = await createImageBitmap(blob);
  const { width, height } = bitmap;
  const offscreen = new OffscreenCanvas(width, height);
  const ctx = offscreen.getContext("2d") as OffscreenCanvasRenderingContext2D;
  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
  bitmap.close();
  return imageData;
}