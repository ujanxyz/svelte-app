import { computeLetterbox } from "@/utils/canvasUtils";
import { generateShortId } from "@/utils/idUtils";

/**
 * Manages a collection of preview canvases (OffscreenCanvas) and associated
 * graphic data (ImageData or raw bitmap). When graphic data is updated, all
 * registered previews for the matching key are redrawn using letterboxing.
 *
 * Key format: `${nodeId}:${slotName}` for slot previews, `${nodeId}` for input node previews.
 *
 * A graphic and its matching preview can be registered in any order. On first
 * insertion, if a match immediately occurs, the preview is updated at once.
 */

type GraphicData =
  | { kind: "imagedata"; imageData: ImageData }
  | { kind: "raw"; uint8arr: Uint8ClampedArray; width: number; height: number };

interface PreviewRegistration {
  registrationKey: string;
  canvas: OffscreenCanvas;
}

/**
 * This class is used by WorkerIoManager to manage preview canvases and their associated graphics.
 */
class PreviewManager {
  private readonly previewsByAssetKey: Map<string, PreviewRegistration[]> = new Map();
  private readonly assetKeyByRegistrationKey: Map<string, string> = new Map();
  private readonly graphics: Map<string /* assetKey */, GraphicData> = new Map();

  // ─── Preview registration ─────────────────────────────────────────────────

  /**
   * Register a preview canvas against an asset key.
   * Returns a registration key for later targeted unregister.
   */
  registerPreview(assetKey: string, canvas: OffscreenCanvas): string {
    const registrationKey = generateShortId("preview", 12);
    const list = this.previewsByAssetKey.get(assetKey);
    const registration: PreviewRegistration = { registrationKey, canvas };
    if (list) {
      list.push(registration);
    } else {
      this.previewsByAssetKey.set(assetKey, [registration]);
    }
    this.assetKeyByRegistrationKey.set(registrationKey, assetKey);

    // Draw immediately if graphic is already available; otherwise show a cross.
    const graphic = this.graphics.get(assetKey);
    if (graphic) {
      this.#drawOnCanvas(canvas, graphic);
    } else {
      this.#drawCross(canvas, assetKey);
    }

    return registrationKey;
  }

  /** Remove exactly one preview registration by registration key. */
  unregister(registrationKey: string): void {
    const assetKey = this.assetKeyByRegistrationKey.get(registrationKey);
    if (!assetKey) return;

    const list = this.previewsByAssetKey.get(assetKey);
    if (!list) {
      this.assetKeyByRegistrationKey.delete(registrationKey);
      return;
    }

    const next = list.filter((entry) => entry.registrationKey !== registrationKey);
    if (next.length > 0) {
      this.previewsByAssetKey.set(assetKey, next);
    } else {
      this.previewsByAssetKey.delete(assetKey);
    }
    this.assetKeyByRegistrationKey.delete(registrationKey);
  }

  // ─── Graphic updates ──────────────────────────────────────────────────────

  /**
   * Set or update the graphic for a key and redraw all matching previews.
   * Pass null to clear the graphic (previews will show a cross).
   */
  setGraphicForKey(assetKey: string, graphic: GraphicData | null): void {
    if (graphic) {
      this.graphics.set(assetKey, graphic);
      this.#syncToPreviews(assetKey);
    } else {
      this.graphics.delete(assetKey);
      this.#syncCrossToPreviews(assetKey);
    }
  }

  /** Remove the graphic for a key and redraw matching previews with a cross. */
  removeGraphic(assetKey: string): void {
    this.graphics.delete(assetKey);
    this.#syncCrossToPreviews(assetKey);
  }

  /**
   * Re-render previews for a key using current graphic data. Call this after
   * an in-place bitmap update from C++/WASM (e.g. on BITMAP_FLUSHED).
   */
  syncPreviewsForKey(assetKey: string): void {
    this.#syncToPreviews(assetKey);
  }

  // ─── Convenience notify methods ───────────────────────────────────────────

  /**
   * Notify that a slot bitmap was updated after pipeline execution.
   * Stores the graphic data and redraws matching previews.
   */
  notifyBitmapUpdated(
    nodeId: string,
    slotName: string,
    uint8arr: Uint8ClampedArray,
    width: number,
    height: number,
  ): void {
    const assetKey = `${nodeId}:${slotName}`;
    this.setGraphicForKey(assetKey, { kind: "raw", uint8arr, width, height });
  }

  /**
   * Notify that input media for a node was loaded or cleared.
   * Pass null imageData to indicate an empty input (previews will show a cross).
   */
  notifyInputMediaUpdated(nodeId: string, imageData: ImageData | null): void {
    const assetKey = nodeId;
    if (imageData) {
      this.setGraphicForKey(assetKey, { kind: "imagedata", imageData });
    } else {
      this.removeGraphic(assetKey);
    }
  }

  // ─── Private rendering helpers ────────────────────────────────────────────

  #syncToPreviews(assetKey: string): void {
    const registrations = this.previewsByAssetKey.get(assetKey);
    if (!registrations?.length) return;
    const graphic = this.graphics.get(assetKey);
    if (!graphic) return;
    for (const registration of registrations) {
      this.#drawOnCanvas(registration.canvas, graphic);
    }
  }

  #syncCrossToPreviews(assetKey: string): void {
    const registrations = this.previewsByAssetKey.get(assetKey);
    if (!registrations?.length) return;
    for (const registration of registrations) {
      this.#drawCross(registration.canvas, assetKey);
    }
  }

  #drawOnCanvas(canvas: OffscreenCanvas, graphic: GraphicData): void {
    const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
    let gw: number, gh: number, imageData: ImageData;

    if (graphic.kind === "imagedata") {
      gw = graphic.imageData.width;
      gh = graphic.imageData.height;
      imageData = graphic.imageData;
    } else {
      gw = graphic.width;
      gh = graphic.height;
      imageData = new ImageData(
        graphic.uint8arr as Uint8ClampedArray<ArrayBuffer>,
        gw,
        gh,
        { colorSpace: "srgb" },
      );
    }

    const { dx, dy, dw, dh } = computeLetterbox(canvas.width, canvas.height, gw, gh);

    // Fill background black (letterbox bars).
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Scale graphic into a temporary canvas, then blit at the letterboxed position.
    const tmp = new OffscreenCanvas(gw, gh);
    (tmp.getContext("2d") as OffscreenCanvasRenderingContext2D).putImageData(imageData, 0, 0);
    ctx.drawImage(tmp, dx, dy, dw, dh);
  }

  #drawCross(canvas: OffscreenCanvas, assetKey: string): void {
    const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
    const { width: cw, height: ch } = canvas;

    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, cw, ch);

    ctx.strokeStyle = "#555";
    ctx.lineWidth = Math.max(1, Math.min(cw, ch) * 0.04);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(cw, ch);
    ctx.moveTo(cw, 0);
    ctx.lineTo(0, ch);
    ctx.stroke();

    // Write the `assetKey` in the center for debugging (optional).
    ctx.fillStyle = "#555";
    ctx.font = `${Math.max(12, Math.round(cw * 0.08))}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(assetKey, cw / 2, ch / 2);
  }
}

export { type GraphicData, PreviewManager };
