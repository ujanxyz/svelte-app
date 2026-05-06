import { drawEmptyCanvas, drawImageDataLetterboxed } from "@/utils/canvasUtils";
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
  private readonly graphics: Map<string /* assetKey */, ImageData> = new Map();

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
    const imageData = this.graphics.get(assetKey);
    if (imageData) {
      drawImageDataLetterboxed(imageData, canvas);
    } else {
      drawEmptyCanvas(canvas, assetKey);
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
  setGraphicForKey(assetKey: string, imageData: ImageData | null): void {
    if (imageData) {
      this.graphics.set(assetKey, imageData);
      this.#syncToPreviews(assetKey);
    } else {
      this.graphics.delete(assetKey);
      this.#syncCrossToPreviews(assetKey);
    }
  }

  /** Remove the graphic for a key and redraw matching previews with a cross. */
  /** @deprecated */
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
    this.setGraphicForKey(assetKey, new ImageData(uint8arr as Uint8ClampedArray<ArrayBuffer>, width, height, { colorSpace: "srgb" }));
  }

  /**
   * Notify that input media for a node was loaded or cleared.
   * Pass null imageData to indicate an empty input (previews will show a cross).
   */
  notifyInputMediaUpdated(nodeId: string, imageData: ImageData | null): void {
    const assetKey = nodeId;
    if (imageData) {
      this.setGraphicForKey(assetKey, imageData);
    } else {
      this.removeGraphic(assetKey);
    }
  }

  // ─── Private sync helpers ─────────────────────────────────────────────────

  #syncToPreviews(assetKey: string): void {
    const registrations = this.previewsByAssetKey.get(assetKey);
    if (!registrations?.length) return;
    const imageData = this.graphics.get(assetKey);
    if (!imageData) return;
    for (const registration of registrations) {
      drawImageDataLetterboxed(imageData, registration.canvas);
    }
  }

  #syncCrossToPreviews(assetKey: string): void {
    const registrations = this.previewsByAssetKey.get(assetKey);
    if (!registrations?.length) return;
    for (const registration of registrations) {
      drawEmptyCanvas(registration.canvas, assetKey);
    }
  }

}

export { PreviewManager };
