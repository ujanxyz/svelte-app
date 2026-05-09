
import type { WorkerIndexedDb } from "./db";
import { type PreviewManager } from "./PreviewManager";

type ArtifactStage = "input" | "output" | "intermediate";

interface BitmapCapturedMessage {
  assetKey: string;
  mode: string;
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
  private readonly indexedDb: WorkerIndexedDb;
  private readonly previewManager: PreviewManager;

  public constructor(indexedDb: WorkerIndexedDb,  previewManager: PreviewManager) {
    this.indexedDb = indexedDb;
    this.previewManager = previewManager;
  }

  public setUpListeners(eventTarget: EventTarget): void {
    eventTarget.addEventListener(EventCodes.BITMAP_CAPTURED, this.#onBitmapCaptured.bind(this));
    eventTarget.addEventListener(EventCodes.INPUT_MEDIA_UPDATED, this.#onInputMediaUpdated.bind(this));
  }

  #onBitmapCaptured(ev: Event): void {
    const { assetKey, mode, imageData } = (ev as CustomEvent).detail as BitmapCapturedMessage;
    console.log("[IoEventsHandler] Bitmap captured for key: ", assetKey, " with imageData: ", imageData, " and mode: ", mode);
    this.previewManager.setGraphicForKey(assetKey, imageData);
    this.previewManager.syncPreviewsForKey(assetKey);
    const stage = this.#toArtifactStage(mode);
    void this.indexedDb.uploadArtifactImage(assetKey, imageData, { stage })
      .catch((err) => {
        console.error("[IoEventsHandler.ts] Failed to persist captured artifact", {
          assetKey,
          mode,
          message: err instanceof Error ? err.message : String(err),
        });
      });
  }

  #onInputMediaUpdated(ev: Event): void {
    const { nodeId, imageData } = (ev as CustomEvent).detail as InputMediaUpdatedMessage;
    this.previewManager.notifyInputMediaUpdated(nodeId, imageData);
  }

  #toArtifactStage(mode: string): ArtifactStage {
    switch (mode) {
      case "encode":
        return "input";
      case "decode":
        return "output";
      case "function":
        return "intermediate";
      default:
        console.warn("[IoEventsHandler.ts] Unknown bitmap capture mode, defaulting to intermediate", { mode });
        return "intermediate";
    }
  }
}

export { EventCodes, type InputMediaUpdatedMessage, IoEventsHandler };
