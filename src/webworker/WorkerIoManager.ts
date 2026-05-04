import type { ioApis } from "@/types/ioApis";

import { type WorkerIndexedDb } from "./db";
import type { ExecutionManager } from "./ExecutionManager";
import { IoEventsHandler } from "./IoEventsHandler";
import { PreviewManager } from "./PreviewManager";

type IoProcessResult = Record<string, any>;

class WorkerIoManager {
  public static readonly CMD_PREFIX = "IO:" as const;

  private readonly exManager: ExecutionManager;
  private readonly indexedDb: WorkerIndexedDb;
  private readonly previewManager: PreviewManager;
  private readonly ioEventsHandler: IoEventsHandler;

  public constructor(exManager: ExecutionManager, indexedDb: WorkerIndexedDb, pipelineEvents: EventTarget) {
    this.exManager = exManager;
    this.indexedDb = indexedDb;
    this.previewManager = new PreviewManager();
    this.ioEventsHandler = new IoEventsHandler(this.previewManager);
    this.ioEventsHandler.setUpListeners(pipelineEvents);
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

      /**
       * "getMediaData": User opens the image viewer for a media file. Returns the
       * full-resolution bitmap for the file, which the image viewer will draw at its
       * native resolution and provide zooming/panning.
       */
      case "getMediaData": {
        const { id } = request as { id: string };
        const blob = await this.indexedDb.getMediaBlob(id);
        const bitmap = await createImageBitmap(blob);
        const meta = await this.indexedDb.getMediaMeta(id);
        return { meta, bitmap };
      }

      /**
       * "listAssets": List compact asset summaries + thumbnails for one asset
       * type. Currently media is implemented; artifacts/outputs are stubs.
       */
      case "listAssets": {
        const { assetType } = request as ioApis.Request<"listAssets">;
        const assetEntries = await this.indexedDb.listAssets(assetType);
        return { assetEntries };
      }

      /**
       * Stage assets prior to execution: create the full-resolution bitmaps for
       * input nodes to consume during execution.
       */
      case "stageAssets": {
        const { isPostRun, assetInfos } = request as ioApis.Request<"stageAssets">;
        console.log("Staging assets: ", { isPostRun, assetInfos });
        if (isPostRun) {
          await this.exManager.stagePostRunAssets(assetInfos);
        } else {
          await this.exManager.stagePreRunAssets(assetInfos);
        }
        return {};
      }

      /**
       * "registerPreview": Register an offscreen canvas for a node's preview.
       * The worker will draw the preview directly onto the offscreen canvas whenever
       * the node's graphic data is updated.
       * The returnd id is later used to deregister the preview and free up resources
       * when the UI is unmounted.
       */
      case "registerPreview": {
        const { slotId, offscreen } = request as ioApis.Request<"registerPreview">;
        const assetKey = `${String(slotId.parent)}:${slotId.name}`;
        const regKey = this.previewManager.registerPreview(assetKey, offscreen);
        return { regKey } as ioApis.Response<"registerPreview">;
      }

      /**
       * "unRegisterPreview": Unregister a previously registered preview using its registration key.
       * This should be called before the preview UI is unmounted.
       */
      case "unRegisterPreview": {
        const { regKey } = request as ioApis.Request<"unRegisterPreview">;
        this.previewManager.unregister(regKey);
        return {} as ioApis.Response<"unRegisterPreview">;
      }


      // ── Graph editing commands ───────────────────────────────────────────────

      default:
        throw new Error("Unknown IO command: " + ioCmd);
    }
  }
}

export { WorkerIoManager };

