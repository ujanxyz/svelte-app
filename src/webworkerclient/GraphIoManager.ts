import type { ioApis } from "@/types/ioApis";
import type { plinfo } from "@/types/plinfo";

import { type WebWorkerClient } from "./WebWorkerClient";

interface RegistryEntry {
  rawNodeId: number;
  slotName: string;
  onscreen: HTMLCanvasElement;
};

interface StoredFileMeta {
  filename: string;
  mimeType: string;
  kind: "binary" | "image";
  size: number;
  lastModified: number;
  createdAt: number;
  updatedAt: number;
}

class GraphIoManager {
  private readonly client: WebWorkerClient;
  /** @deprecated */
  private readonly previewPool: Map<string, RegistryEntry> = new Map();

  public constructor(client: WebWorkerClient) {
    this.client = client;
  }

  public async uploadMedia(request: ioApis.Request<"uploadMedia">): Promise<ioApis.Response<"uploadMedia">> {
    return await this.#invokeAsync<"uploadMedia">("uploadMedia", request);
  }

  public async listMedia(request: ioApis.Request<"listMedia">): Promise<ioApis.Response<"listMedia">> {
    return await this.#invokeAsync<"listMedia">("listMedia", request);
  }

  public async deleteMedia(request: ioApis.Request<"deleteMedia">): Promise<ioApis.Response<"deleteMedia">> {
    return await this.#invokeAsync<"deleteMedia">("deleteMedia", request);
  }

  //--------------------------------

  public async getOrCreatePreviewCanvas(slotId: plinfo.SlotId): Promise<HTMLCanvasElement> {
    const encodedId = `${slotId.parent}:${slotId.name}`;
    let entry = this.previewPool.get(encodedId);
    if (!!entry) {
      return entry.onscreen;
    }

    const newCanvas = document.createElement("canvas");
    newCanvas.width = 100;
    newCanvas.height = 100;

    entry = {
      rawNodeId: slotId.parent,
      slotName: slotId.name,
      onscreen: newCanvas,
    };
    this.previewPool.set(encodedId, entry);

    const offscreen: OffscreenCanvas = newCanvas.transferControlToOffscreen();
    const response = await this.client.send("IO:REGISTER_CANVAS", { rawNodeId: slotId.parent, slotName: slotId.name, canvas: offscreen }, [offscreen], 5000);
    return newCanvas;
  }

  public async deletePreviewCanvas(slotId: plinfo.SlotId): Promise<void> {
    const encodedId = `${slotId.parent}:${slotId.name}`;
    const mapVal = this.previewPool.get(encodedId);
    if (!mapVal) return;
    await this.client.send("IO:DELETE_CANVAS", { rawNodeId: slotId.parent, slotName: slotId.name }, [], 5000);
    this.previewPool.delete(encodedId);
  }

  async #invokeAsync<K extends ioApis.Names>(name: K, request: ioApis.Request<K>): Promise<ioApis.Response<K>> {
      const { ok, code, payload, error } = await this.client.send(`IO:${name}`, request, []);
      if (!ok) {
        throw new Error(`${code}: ${error}`);
      }
      return payload! as ioApis.Response<K>;
    }
};

export { GraphIoManager };
