import * as canvasUtils from "@/utils/canvasUtils";

import type { WorkerIndexedDb } from "../db";
import type { PreviewManager } from "../PreviewManager";
import type { AwaitTaskProcessor } from "./types";

interface AssetDbStoreTask {
  mode: "store";
  assetId: string;
  width: number;
  height: number;
  pixels: Uint8Array;
}

interface AssetDbLoadTask {
  mode: "load";
  assetUri: string;
  assetId: string;
}

interface AssetDbStoreResult {
  assetId: string;
}

interface AssetDbLoadResult {
  assetId: string;
  imageData: ImageData;
}

type AssetDbTask = AssetDbStoreTask | AssetDbLoadTask;
type AssetDbResult = AssetDbStoreResult | AssetDbLoadResult;

class AssetDbAwaitProcessor implements AwaitTaskProcessor<AssetDbTask, AssetDbResult> {
  public readonly name = "assetDb";
  private readonly indexedDb: WorkerIndexedDb;
  private readonly previewManager: PreviewManager;

  public constructor(indexedDb: WorkerIndexedDb, previewManager: PreviewManager) {
    this.indexedDb = indexedDb;
    this.previewManager = previewManager;
  }

  async processAsync(taskId: string, taskData: AssetDbTask): Promise<AssetDbResult> {
    if (taskData.mode === "store") {
      return await this.#storeAsync(taskData);
    } else {
      return await this.#loadAsync(taskData);
    }
  }

  async #storeAsync(task: AssetDbStoreTask): Promise<AssetDbStoreResult> {
    const { assetId, width, height, pixels } = task;
    console.log(`[AssetDbAwaitProcessor] Received store task with width=${width}, height=${height}, pixels length=${pixels.length}`);
    const imgData = new ImageData(new Uint8ClampedArray(pixels), width, height, {colorSpace: "srgb", pixelFormat: "rgba-unorm8"});
    const { id, meta: artifactMeta } = await this.indexedDb.uploadArtifactImage(assetId, imgData, { stage: "output" });
    this.previewManager.setGraphicForKey(assetId, imgData);
    console.log(`[AssetDbAwaitProcessor] Stored asset with id=${id}, meta=`, artifactMeta);
    return { assetId: id };
  }

  async #loadAsync(task: AssetDbLoadTask): Promise<AssetDbLoadResult> {
    const { assetUri, assetId } = task;
    console.log(`[AssetDbAwaitProcessor.#loadAsync] Received load task for URI: ${assetUri}`);
    const { meta, bitmap } = await this.indexedDb.getAssetBitmap(assetUri);
    console.log(`[AssetDbAwaitProcessor] Loaded asset with id=${meta.id}, bitmap=`, bitmap);
    const imageData = await canvasUtils.bitmapToImageData(bitmap) as ImageData;
    if (imageData.colorSpace !== "srgb") {
      console.error("[JsBitmapPool] Unsupported image data color space: ", imageData.colorSpace);
    }
    const { id, meta: artifactMeta } = await this.indexedDb.uploadArtifactImage(assetId, imageData, { stage: "input" });
    this.previewManager.setGraphicForKey(assetId, imageData);
    return { assetId: meta.id, imageData };
  }
}

export { AssetDbAwaitProcessor };