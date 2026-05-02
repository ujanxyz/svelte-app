import type { wa } from "@/types/wa";

import { WorkerIndexedDb } from "./db";
import { EventCodes, IoEventsHandler } from "./IoEventsHandler";
import { PreviewManager } from "./PreviewManager";

type IoProcessResult = Record<string, any>;

class WorkerIoManager {
  private readonly cmdPrefix: string = "IO:";
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
    if (!code.startsWith(this.cmdPrefix)) {
      throw new Error("Invalid code: " + code);
    }
    const ioCmd: string = code.substring(this.cmdPrefix.length);
    switch (ioCmd) {

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

      /**
       * UPLOAD_MEDIA: User uploads a media file (not yet linked to any node).
       * Stores the file in IndexedDb under its original filename.
       */
      case "UPLOAD_MEDIA": {
        const { file, overwrite } = request as { file: File; overwrite?: boolean };
        const meta = await this.indexedDb.uploadMedia(file, { overwrite: overwrite ?? false });
        return { status: "OK", message: "Media uploaded", meta };
      }

      /**
       * PICK_MEDIA: User picks an uploaded media file for a graph input node.
       * Updates the node state and triggers INPUT_MEDIA_UPDATED.
       */
      case "PICK_MEDIA": {
        const { nodeId, filename } = request as { nodeId: string; filename: string };
        await this.#linkMediaToInputNode(nodeId, filename);
        return { status: "OK", message: "Media picked", nodeId, filename };
      }

      /**
       * CHANGE_MEDIA: User replaces the media file on an existing input node.
       * Same backend steps as PICK_MEDIA.
       */
      case "CHANGE_MEDIA": {
        const { nodeId, filename } = request as { nodeId: string; filename: string };
        await this.#linkMediaToInputNode(nodeId, filename);
        return { status: "OK", message: "Media changed", nodeId, filename };
      }

      /**
       * CLEAR_MEDIA: User removes the media reference from an input node
       * (does NOT delete the media file from db).
       */
      case "CLEAR_MEDIA": {
        const { nodeId } = request as { nodeId: string };
        this.#callCpp("clearInputNodeMedia", { nodeId });
        this.#dispatchInputMediaUpdated(nodeId, null);
        return { status: "OK", message: "Media cleared", nodeId };
      }

      /**
       * DELETE_MEDIA: User deletes one or more media files from db.
       * Clears the reference on any input node that was pointing to a deleted file.
       */
      case "DELETE_MEDIA": {
        const { filenames } = request as { filenames: string[] };
        const clearedNodes: string[] = [];
        for (const filename of filenames) {
          const affectedNodes = this.#callCpp("getInputNodesForMedia", { filename }) as {
            nodeIds: string[];
          };
          for (const nodeId of affectedNodes.nodeIds ?? []) {
            this.#callCpp("clearInputNodeMedia", { nodeId });
            this.#dispatchInputMediaUpdated(nodeId, null);
            clearedNodes.push(nodeId);
          }
          await this.indexedDb.deleteFile(filename);
        }
        return { status: "OK", message: "Media deleted", filenames, clearedNodes };
      }

      // ── Legacy file commands (kept for backward compat) ──────────────────────
      case "SEND_FILE": {
        const { file } = request as { file: File };
        this.pipelineEvents.dispatchEvent(new CustomEvent(EventCodes.FILE_UPLOADED, { detail: { file } }));
        const meta = await this.indexedDb.putFile(file);
        return { status: "OK", message: "File received", meta };
      }
      case "LIST_FILES": {
        const files = await this.indexedDb.listFiles();
        return { status: "OK", message: "Files listed", files };
      }
      case "DELETE_FILE": {
        const { filename } = request as { filename: string };
        const deleted = await this.indexedDb.deleteFile(filename);
        return { status: "OK", message: "File delete attempted", filename, deleted };
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

