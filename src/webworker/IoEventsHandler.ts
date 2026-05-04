
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
  }

  #onBitmapCreated(ev: Event): void {
    const { id, width, height, uint8arr } = (ev as CustomEvent).detail as BitmapCreatedMessage;
    if (!(uint8arr instanceof Uint8ClampedArray)) {
      throw new Error("Invalid bitmap data: uint8arr is not a Uint8ClampedArray");
    }
    this.previewManager.setGraphicForKey(id, { kind: "raw", uint8arr, width, height });
    console.log("[IoEventsHandler] Registered bitmap for key: ", id);
  }

  #onBitmapDeleted(ev: Event): void {
    const { id } = (ev as CustomEvent).detail as { id: string };
    this.previewManager.removeGraphic(id);
    console.log("[IoEventsHandler] Deleted bitmap for key: ", id);
  }

  #onBitmapFlushed(ev: Event): void {
    const { id } = (ev as CustomEvent).detail as { id: string };
    this.previewManager.syncPreviewsForKey(id);
    console.log("[IoEventsHandler] Flushed bitmap for key: ", id);
  }

  #onInputMediaUpdated(ev: Event): void {
    const { nodeId, imageData } = (ev as CustomEvent).detail as InputMediaUpdatedMessage;
    this.previewManager.notifyInputMediaUpdated(nodeId, imageData);
  }
}

export { EventCodes, type InputMediaUpdatedMessage, IoEventsHandler };
