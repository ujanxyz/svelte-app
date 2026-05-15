import type { flow } from "@/types/flow";
import type { grph } from "@/types/grph";
import type { wa } from "@/types/wa";
import { makeImageDataFromBlob } from "@/utils/canvasUtils";
import { parseAssetUri } from "@/utils/strUtils";
import { WgpuTaskManager } from "@/webworker/wgpu/WgpuTaskManager";

import type { WorkerIndexedDb } from "./db";

/**
 * This class manages the execution of the backend pipeline in the web worker.
 * It can support incremental execution.
 */
class ExecutionManager {
  private readonly indexedDb: WorkerIndexedDb;
  private readonly assetStaging: wa.AssetStagingInterface;
  private readonly wgpuTaskManager: WgpuTaskManager;


  public constructor(wasmAttachments: wa.WasmAttachments, indexedDb: WorkerIndexedDb) {
    this.indexedDb = indexedDb;
    this.assetStaging = wasmAttachments.assetStaging;
    this.wgpuTaskManager = new WgpuTaskManager(wasmAttachments.wgpuTaskPool);
  }

  public async stagePreRunAssets(assetInfos: grph.AssetInfo[]): Promise<void> {
    console.log("[ExecutionManager] Staging pre-run assets: ", assetInfos);
    for (const assetInfo of assetInfos) {
      if (assetInfo.dtype !== "bitmap") {
        console.warn(`Unsupported asset dtype: ${assetInfo.dtype}`);
        continue;
      }
      if (assetInfo.assetUri === null) {
        console.warn(`Asset ${assetInfo.slotId.parent}:${assetInfo.slotId.name} has null assetUri, skipping staging`);
        continue;
      }
      const assetUri = assetInfo.assetUri;
      const parsed = parseAssetUri(assetUri);
      if (!parsed) {
        console.warn(`Invalid asset URI: ${assetUri}`);
        continue;
      }
      if (parsed.scheme !== "idb") {
        console.warn(`Unsupported asset URI scheme: ${parsed.scheme}`);
        continue;
      }
      if (parsed.store !== "media") {
        console.warn(`Unsupported asset URI store: ${parsed.store}`);
        continue;
      }
      const mediaId = parsed.id;

      // Fetch the media blob and convert to ImageData for staging. We need the full-resolution
      // image for the file, during execution (not just the thumbnail).
      const blob = await this.indexedDb.getMediaBlob(mediaId);
      const imageData = await makeImageDataFromBlob(blob);

      // Stage the image-data for the for consumption during pipeline run.
      const slotIdStr = `${assetInfo.slotId.parent}:${assetInfo.slotId.name}`;
      this.assetStaging.stageImageData(slotIdStr, assetUri, imageData);
      console.log(`[ExecutionManager] Staged asset ${assetInfo.assetUri} to slot ${assetInfo.slotId.parent} : ${assetInfo.slotId.name}`);
    }
  }

  public async stagePostRunAssets(assetInfos: grph.AssetInfo[]): Promise<void> {
    throw new Error("Post-run asset staging is not implemented yet");
  }

  public async fulfillTasks(awaitInfos: flow.AwaitEntry[]): Promise<void> {
    for (const awaitInfo of awaitInfos) {
      const { channel, workId } = awaitInfo;
      switch (channel) {
        case "webgpu": {
          console.log("@fulfillTasks ==> ", this.wgpuTaskManager);
          await this.wgpuTaskManager.fulfillTask(workId);
          break;
        }
        default: {
          throw new Error(`Unknown channel: ${channel}, for workId: ${workId}`);
        }
      }
    }
  }
}

export { ExecutionManager };
