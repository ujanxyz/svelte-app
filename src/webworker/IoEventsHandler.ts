
import { type PreviewManager } from "./PreviewManager";

interface BitmapCapturedMessage {
  assetKey: string;
  imageData: ImageData;
}

interface InputMediaUpdatedMessage {
  nodeId: string;
  imageData: ImageData | null;
}

const EventCodes = Object.freeze({
  BITMAP_CAPTURED: "BITMAP_CAPTURED",
  INPUT_MEDIA_UPDATED: "INPUT_MEDIA_UPDATED",
});

/**
 * Listens to C++/WASM pipeline events and forwards them to the PreviewManager.
 * - BITMAP_CAPTURED  — registers new bitmap data for a slot key.
 * - INPUT_MEDIA_UPDATED — updates previews for a graph input node.
 * - FILE_UPLOADED   — deprecated; kept for backward compatibility.
 */
class IoEventsHandler {
  private readonly previewManager: PreviewManager;

  public constructor(previewManager: PreviewManager) {
    this.previewManager = previewManager;
  }

  public setUpListeners(eventTarget: EventTarget): void {
    eventTarget.addEventListener(EventCodes.BITMAP_CAPTURED, this.#onBitmapCaptured.bind(this));
    eventTarget.addEventListener(EventCodes.INPUT_MEDIA_UPDATED, this.#onInputMediaUpdated.bind(this));
  }

  #onBitmapCaptured(ev: Event): void {
    const { assetKey, imageData } = (ev as CustomEvent).detail as BitmapCapturedMessage;
    const { width, height } = imageData;
    console.log("[IoEventsHandler] Bitmap captured for key: ", assetKey, " with imageData: ", imageData);
    this.previewManager.setGraphicForKey(assetKey, imageData);
    this.previewManager.syncPreviewsForKey(assetKey);
  }

  #onInputMediaUpdated(ev: Event): void {
    const { nodeId, imageData } = (ev as CustomEvent).detail as InputMediaUpdatedMessage;
    this.previewManager.notifyInputMediaUpdated(nodeId, imageData);
  }
}

export { EventCodes, type InputMediaUpdatedMessage, IoEventsHandler };
