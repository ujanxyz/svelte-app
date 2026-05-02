import type { ioApis } from "@/types/ioApis";
import type { wa } from "@/types/wa";
import type { MediaInfoMessage } from "@/types/worker-message-types";

import { WorkerIndexedDb } from "./db";
import { EventCodes, IoEventsHandler } from "./IoEventsHandler";
import { PreviewManager } from "./PreviewManager";

type IoProcessResult = Record<string, any>;

class WorkerIoManager {
  public static readonly CMD_PREFIX = "IO:" as const;

  private readonly pipelineEvents: EventTarget;
  private readonly previewManager: PreviewManager;
  private readonly ioEventsHandler: IoEventsHandler;
  private readonly indexedDb: WorkerIndexedDb;
  private readonly graph: wa.ApiInstance | null;

  public constructor(pipelineEvents: EventTarget, graph?: wa.ApiInstance) {
    this.pipelineEvents = pipelineEvents;
    this.graph = graph ?? null;
    this.previewManager = new PreviewManager();
    this.ioEventsHandler = new IoEventsHandler(this.previewManager);
    this.ioEventsHandler.setUpListeners(pipelineEvents);
    this.indexedDb = new WorkerIndexedDb({ idleCloseMs: 60_000 });
  }

  public async process(code: string, request: any): Promise<Error | IoProcessResult> {
    if (!code.startsWith(WorkerIoManager.CMD_PREFIX)) {
      throw new Error("Invalid code: " + code);
    }
    const ioCmd: string = code.substring(WorkerIoManager.CMD_PREFIX.length);
    switch (ioCmd) {

      // ── Media manager apis ──────────────────────────────────────────-------
      /**
       * "uploadMedia": User uploads a media file (not yet linked to any node).
       * Stores the file in IndexedDb under its original filename.
       */
      case "uploadMedia": {
        const { file, overwrite } = request as { file: File; overwrite: boolean };
        const { meta, thumbnail } = await this.indexedDb.uploadMedia(file, overwrite);
        return { meta, thumbnail };
      }

      /**
       * "listMedia": User opens the media manager or refreshes the media list.
       * Returns the metadata and thumbnail for all media files stored in IndexedDb.
       */
      case "listMedia": {
        const mediaEntries = await this.indexedDb.listMedia();
        return { mediaEntries };
      }

      /**
       * "deleteMedia": User deletes one or more media files from the media manager.
       * Deletes the file from IndexedDb and clears the reference on any input node
       * that was using the deleted file, triggering preview updates.
       */
      case "deleteMedia": {
        const { ids } = request as { ids: string[] };
        const { deletedIds } = await this.indexedDb.deleteMedia(ids);
        return { deletedIds };
      }

      // ── Legacy canvas registration ──────────────────────────────────────────
      case "REGISTER_CANVAS": {
        const { nodeId, slotName, canvas } = request as {
          nodeId: string;
          slotName: string;
          canvas: OffscreenCanvas;
        };
        const key = PreviewManager.slotKey(nodeId, slotName);
        this.ioEventsHandler.registerPreview(key, canvas);
        return { status: "OK", message: "Canvas registered", key };
      }

      // ── Graph editing commands ───────────────────────────────────────────────

      /**
       * CREATE_INPUT: User adds a graph input node.
       * Creates an empty media entry in C++ state and optionally registers a
       * preview canvas.
       */
      case "CREATE_INPUT": {
        const { nodeId, canvas } = request as {
          nodeId: string;
          canvas?: OffscreenCanvas;
        };
        this.#callCpp("createInputNode", { nodeId });
        if (canvas) {
          this.previewManager.registerInputPreview(nodeId, canvas);
        }
        return { status: "OK", message: "Input node created", nodeId };
      }

      default:
        throw new Error("Unknown IO command: " + ioCmd);
    }
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  /**
   * Update C++ node state to reference a new media file, then load the file
   * from IndexedDb and dispatch INPUT_MEDIA_UPDATED so previews refresh.
   */
  async #linkMediaToInputNode(nodeId: string, filename: string): Promise<void> {
    this.#callCpp("setInputNodeMedia", { nodeId, filename });
    const imageData = await this.indexedDb.getImageData(filename);
    this.#dispatchInputMediaUpdated(nodeId, imageData);
  }

  #dispatchInputMediaUpdated(nodeId: string, imageData: ImageData | null): void {
    this.pipelineEvents.dispatchEvent(
      new CustomEvent(EventCodes.INPUT_MEDIA_UPDATED, { detail: { nodeId, imageData } }),
    );
  }

  /**
   * Call a C++ API by name. Returns the response data on success.
   * Throws if the C++ API is unavailable or returns an error status.
   */
  #callCpp(apiName: string, request: any): Record<string, any> {
    if (!this.graph) {
      throw new Error(`C++ graph not available (API: ${apiName})`);
    }
    const fn = this.graph[apiName];
    if (typeof fn !== "function") {
      throw new Error(`C++ API not found: ${apiName}`);
    }
    const response = fn.bind(this.graph)(request) as wa.ApiResponse;
    if (!response.ok) {
      throw new Error(`C++ error [${apiName}]: ${response.status}`);
    }
    return response.data;
  }
}

export { WorkerIoManager };

