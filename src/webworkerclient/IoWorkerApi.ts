import type { ioApis } from "@/types/ioApis";

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

class IoWorkerApi {
  public static CONTEXT_KEY = Symbol("io");
  private readonly client: WebWorkerClient;

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

  public async getMediaData(request: ioApis.Request<"getMediaData">): Promise<ioApis.Response<"getMediaData">> {
    return await this.#invokeAsync<"getMediaData">("getMediaData", request);
  }

  public async listAssets(request: ioApis.Request<"listAssets">): Promise<ioApis.Response<"listAssets">> {
    return await this.#invokeAsync<"listAssets">("listAssets", request);
  }

  public async stageAssets(request: ioApis.Request<"stageAssets">): Promise<ioApis.Response<"stageAssets">> {
    return await this.#invokeAsync<"stageAssets">("stageAssets", request);
  }

  public async registerPreview(request: ioApis.Request<"registerPreview">): Promise<ioApis.Response<"registerPreview">> {
    const { offscreen } = request;
    return await this.#invokeAsync<"registerPreview">("registerPreview", request, [offscreen]);
  }

  public async unRegisterPreview(request: ioApis.Request<"unRegisterPreview">): Promise<ioApis.Response<"unRegisterPreview">> {
    return await this.#invokeAsync<"unRegisterPreview">("unRegisterPreview", request);
  }

  //-- Private methods --

  async #invokeAsync<K extends ioApis.Names>(name: K, request: ioApis.Request<K>, transfer: Transferable[] = []): Promise<ioApis.Response<K>> {
      const { ok, code, payload, error } = await this.client.send(`IO:${name}`, request, transfer);
      if (!ok) {
        throw new Error(`${code}: ${error}`);
      }
      return payload! as ioApis.Response<K>;
    }
};

export { IoWorkerApi };
