
import { type PreviewManager } from "./PreviewManager";

interface BitmapCreatedMessage {
  id: string;
  width: number;
  height: number;
  numBytes: number;
  uint8arr: Uint8ClampedArray;
}

interface InputMediaUpdatedMessage {
  nodeId: string;
  imageData: ImageData | null;
}

const EventCodes = Object.freeze({
  BITMAP_CREATED: "BITMAP_CREATED",
  BITMAP_DELETED: "BITMAP_DELETED",
  BITMAP_FLUSHED: "BITMAP_FLUSHED",
  INPUT_MEDIA_UPDATED: "INPUT_MEDIA_UPDATED",
  /** @deprecated Use INPUT_MEDIA_UPDATED instead. */
  FILE_UPLOADED: "FILE_UPLOADED",
});

/**
 * Listens to C++/WASM pipeline events and forwards them to the PreviewManager.
 * - BITMAP_CREATED  — registers new bitmap data for a slot key.
 * - BITMAP_FLUSHED  — re-renders previews after an in-place bitmap update.
 * - BITMAP_DELETED  — removes bitmap data and clears matching previews.
 * - INPUT_MEDIA_UPDATED — updates previews for a graph input node.
 * - FILE_UPLOADED   — deprecated; kept for backward compatibility.
 */
class IoEventsHandler {
  private readonly previewManager: PreviewManager;

  public constructor(previewManager: PreviewManager) {
    this.previewManager = previewManager;
  }

  public setUpListeners(eventTarget: EventTarget): void {
    eventTarget.addEventListener(EventCodes.BITMAP_CREATED, this.#onBitmapCreated.bind(this));
    eventTarget.addEventListener(EventCodes.BITMAP_DELETED, this.#onBitmapDeleted.bind(this));
    eventTarget.addEventListener(EventCodes.BITMAP_FLUSHED, this.#onBitmapFlushed.bind(this));
    eventTarget.addEventListener(EventCodes.INPUT_MEDIA_UPDATED, this.#onInputMediaUpdated.bind(this));
    eventTarget.addEventListener(EventCodes.FILE_UPLOADED, this.#onFileUploaded.bind(this));
  }

  /** Register a preview canvas. The key should use PreviewManager key format. */
  public registerPreview(key: string, canvas: OffscreenCanvas): void {
    this.previewManager.registerPreview(key, canvas);
  }

  /** Unregister all preview canvases for a key. */
  public unregisterPreview(key: string): void {
    this.previewManager.unregister(key);
  }

  #onBitmapCreated(ev: Event): void {
    const { id, width, height, uint8arr } = (ev as CustomEvent).detail as BitmapCreatedMessage;
    if (!(uint8arr instanceof Uint8ClampedArray)) {
      throw new Error("Invalid bitmap data: uint8arr is not a Uint8ClampedArray");
    }
    this.previewManager.setGraphicForKey(id, { kind: "raw", uint8arr, width, height });
  }

  #onBitmapDeleted(ev: Event): void {
    const { id } = (ev as CustomEvent).detail as { id: string };
    this.previewManager.removeGraphic(id);
  }

  #onBitmapFlushed(ev: Event): void {
    const { id } = (ev as CustomEvent).detail as { id: string };
    this.previewManager.syncPreviewsForKey(id);
  }

  #onInputMediaUpdated(ev: Event): void {
    const { nodeId, imageData } = (ev as CustomEvent).detail as InputMediaUpdatedMessage;
    this.previewManager.notifyInputMediaUpdated(nodeId, imageData);
  }

  /** @deprecated FILE_UPLOADED is deprecated. Use INPUT_MEDIA_UPDATED. */
  #onFileUploaded(ev: Event): void {
    const { file } = (ev as CustomEvent).detail as { file: File };
    console.warn(`FILE_UPLOADED is deprecated. Received file: ${file.name}`);

    FileToImageBitmap(file).then((imageData) => {
      if (!imageData) {
        console.warn(`Uploaded file "${file.name}" is not a valid image.`);
        return;
      }
      // Derive a pseudo node id from the filename for legacy compatibility.
      const pseudoNodeId = `file:${file.name}`;
      this.previewManager.notifyInputMediaUpdated(pseudoNodeId, imageData);
    }).catch((err) => {
      console.error(`Error processing uploaded file "${file.name}":`, err);
    });
  }
}

// ─── File / bitmap helpers (kept for use by FILE_UPLOADED and other callers) ──

async function FileToImageBitmap(file: File): Promise<ImageData | null> {
  if (typeof file.type === "string" && !file.type.startsWith("image/")) {
    console.error(`File "${file.name}" is not an image. mimeType=${file.type}`);
    return null;
  }
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    return ctx.getImageData(0, 0, canvas.width, canvas.height, { colorSpace: "srgb" });
  } catch (err) {
    console.error(`Error processing image file "${file.name}":`, err);
    return null;
  }
}

export { EventCodes, type InputMediaUpdatedMessage,IoEventsHandler };
