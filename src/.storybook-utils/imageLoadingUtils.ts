/**
 * Shared utilities for loading images in Storybook stories.
 * Used by MediaManager and ImageViewer stories to load actual images from /public/pics.
 */

export interface LoadedImageData {
  blob: Blob;
  bitmap: ImageBitmap;
  width: number;
  height: number;
}

/**
 * Infer MIME type from filename extension.
 */
export function inferMimeType(filename: string, fallback = "image/jpeg"): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  return fallback;
}

/**
 * Extract filename from a URL (removing query params, fragments, and path).
 */
export function filenameFromUrl(picUrl: string): string {
  const clean = picUrl.split("?")[0]?.split("#")[0] ?? picUrl;
  return clean.split("/").pop() || "mock-image.jpg";
}

/**
 * Load an image from a URL and convert to blob + bitmap.
 */
export async function loadImageFromUrl(picUrl: string): Promise<LoadedImageData> {
  const response = await fetch(picUrl);
  if (!response.ok) {
    throw new Error(`Failed to load image: ${picUrl} (${response.status})`);
  }
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);
  return {
    blob,
    bitmap,
    width: bitmap.width,
    height: bitmap.height,
  };
}

/**
 * Create a canvas-based placeholder image of given dimensions with gradient + grid.
 * Used for MockImageViewerProvider when synthetic test images are needed.
 */
export async function createPlaceholderBitmap(
  width: number,
  height: number,
  label: string,
): Promise<ImageBitmap> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, "#153777");
  grad.addColorStop(1, "#a64e2f");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  const step = Math.max(28, Math.floor(Math.min(width, height) / 9));
  for (let x = 0; x < width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.font = `bold ${Math.max(16, Math.floor(Math.min(width, height) * 0.06))}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, width / 2, height / 2);

  return await createImageBitmap(canvas);
}
