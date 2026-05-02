/**
 * Manages a collection of preview canvases (OffscreenCanvas) and associated
 * graphic data (ImageData or raw bitmap). When graphic data is updated, all
 * registered previews for the matching key are redrawn using letterboxing.
 *
 * Key formats:
 *   - Input node:  /$in/<node_id>
 *   - Output node: /$out/<node_id>
 *   - Slot:        /$slot/<node_id>:<slot_name>
 *
 * A graphic and its matching preview can be registered in any order. On first
 * insertion, if a match immediately occurs, the preview is updated at once.
 */

type GraphicData =
  | { kind: "imagedata"; imageData: ImageData }
  | { kind: "raw"; uint8arr: Uint8ClampedArray; width: number; height: number };

class PreviewManager {
  private readonly previews: Map<string, OffscreenCanvas[]> = new Map();
  private readonly graphics: Map<string, GraphicData> = new Map();

  // ─── Key helpers ──────────────────────────────────────────────────────────

  static inputKey(nodeId: string): string {
    return `/$in/${nodeId}`;
  }

  static outputKey(nodeId: string): string {
    return `/$out/${nodeId}`;
  }

  static slotKey(nodeId: string, slotName: string): string {
    return `/$slot/${nodeId}:${slotName}`;
  }

  // ─── Preview registration ─────────────────────────────────────────────────

  /** Register a preview canvas against an arbitrary key. */
  registerPreview(key: string, canvas: OffscreenCanvas): void {
    const list = this.previews.get(key);
    if (list) {
      list.push(canvas);
    } else {
      this.previews.set(key, [canvas]);
    }
    // Draw immediately if graphic is already available; otherwise show a cross.
    const graphic = this.graphics.get(key);
    if (graphic) {
      this.#drawOnCanvas(canvas, graphic);
    } else {
      this.#drawCross(canvas);
    }
  }

  /** Register a preview canvas against a graph input node. */
  registerInputPreview(nodeId: string, canvas: OffscreenCanvas): void {
    this.registerPreview(PreviewManager.inputKey(nodeId), canvas);
  }

  /** Register a preview canvas against a graph output node. */
  registerOutputPreview(nodeId: string, canvas: OffscreenCanvas): void {
    this.registerPreview(PreviewManager.outputKey(nodeId), canvas);
  }

  /** Remove all preview canvases registered for a key. */
  unregister(key: string): void {
    this.previews.delete(key);
  }

  // ─── Graphic updates ──────────────────────────────────────────────────────

  /**
   * Set or update the graphic for a key and redraw all matching previews.
   * Pass null to clear the graphic (previews will show a cross).
   */
  setGraphicForKey(key: string, graphic: GraphicData | null): void {
    if (graphic) {
      this.graphics.set(key, graphic);
      this.#syncToPreviews(key);
    } else {
      this.graphics.delete(key);
      this.#syncCrossToPreviews(key);
    }
  }

  /** Remove the graphic for a key and redraw matching previews with a cross. */
  removeGraphic(key: string): void {
    this.graphics.delete(key);
    this.#syncCrossToPreviews(key);
  }

  /**
   * Re-render previews for a key using current graphic data. Call this after
   * an in-place bitmap update from C++/WASM (e.g. on BITMAP_FLUSHED).
   */
  syncPreviewsForKey(key: string): void {
    this.#syncToPreviews(key);
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
    const key = PreviewManager.slotKey(nodeId, slotName);
    this.setGraphicForKey(key, { kind: "raw", uint8arr, width, height });
  }

  /**
   * Notify that input media for a node was loaded or cleared.
   * Pass null imageData to indicate an empty input (previews will show a cross).
   */
  notifyInputMediaUpdated(nodeId: string, imageData: ImageData | null): void {
    const key = PreviewManager.inputKey(nodeId);
    if (imageData) {
      this.setGraphicForKey(key, { kind: "imagedata", imageData });
    } else {
      this.removeGraphic(key);
    }
  }

  // ─── Private rendering helpers ────────────────────────────────────────────

  #syncToPreviews(key: string): void {
    const canvases = this.previews.get(key);
    if (!canvases?.length) return;
    const graphic = this.graphics.get(key);
    if (!graphic) return;
    for (const canvas of canvases) {
      this.#drawOnCanvas(canvas, graphic);
    }
  }

  #syncCrossToPreviews(key: string): void {
    const canvases = this.previews.get(key);
    if (!canvases?.length) return;
    for (const canvas of canvases) {
      this.#drawCross(canvas);
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

  #drawCross(canvas: OffscreenCanvas): void {
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
  }
}

/**
 * Compute letterbox parameters: fit a graphic of size (gw x gh) into a canvas
 * of size (cw x ch), preserving aspect ratio, centered, with black bars.
 */
function computeLetterbox(
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

export { type GraphicData,PreviewManager };
