import type { base } from "@/types/base";

/**
 * Shared canvas rendering utilities. Used by PreviewManager (web worker)
 * and ImageViewer (main thread).
 */

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
  const scale = computeFitScale(cw, ch, gw, gh);
  const dw = Math.round(gw * scale)|0;
  const dh = Math.round(gh * scale)|0;
  const dx = Math.round((cw - dw) / 2)|0;
  const dy = Math.round((ch - dh) / 2)|0;
  return { dx, dy, dw, dh };
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

/**
 * Converts an ImageBitmap to ImageData by drawing it onto an OffscreenCanvas and extracting the pixel data.
 *
 * @param imageBitmap The input ImageBitmap to convert to ImageData.
 * @returns A Promise that resolves to an ImageData object.
 */
export async function bitmapToImageData(imageBitmap: ImageBitmap): Promise<ImageData> {
  const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
  const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
  ctx.drawImage(imageBitmap, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height) as ImageData;
}

/**
 * Draw an ImageData onto an OffscreenCanvas using letterbox scaling.
 * The canvas background is filled black before drawing.
 */
export function drawImageDataLetterboxed(
  imageData: ImageData,
  canvas: OffscreenCanvas,
): void {
  const ctx = (canvas as OffscreenCanvas).getContext("2d") as OffscreenCanvasRenderingContext2D;
  const { width: gw, height: gh } = imageData;
  const { dx, dy, dw, dh } = computeLetterbox(canvas.width, canvas.height, gw, gh);

  // Fill background black (letterbox bars).
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Scale graphic into a temporary canvas, then blit at the letterboxed position.
  const tmp = new OffscreenCanvas(gw, gh);
  (tmp.getContext("2d") as OffscreenCanvasRenderingContext2D).putImageData(imageData, 0, 0);
  ctx.drawImage(tmp, dx, dy, dw, dh);
}

/**
 * Draw a diagonal cross placeholder onto an OffscreenCanvas.
 * Optionally renders a debug label in the center.
 */
export function drawEmptyCanvas(canvas: OffscreenCanvas, label?: string): void {
  const ctx = (canvas as OffscreenCanvas).getContext("2d") as OffscreenCanvasRenderingContext2D;
  const { width: cw, height: ch } = canvas;

  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, cw, ch);

  ctx.strokeStyle = "#888888";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(cw, ch);
  ctx.moveTo(cw, 0);
  ctx.lineTo(0, ch);
  ctx.stroke();

  if (label) {
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `${Math.max(12, Math.round(cw * 0.08))}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, cw / 2, ch / 2);
  }
}