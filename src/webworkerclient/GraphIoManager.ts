import type { plinfo } from "@/types/plinfo";

import { type WebWorkerClient } from "./WebWorkerClient";

interface RegistryEntry {
  rawNodeId: number;
  slotName: string;
  onscreen: HTMLCanvasElement;
};

class GraphIoManager {
  private readonly client: WebWorkerClient;
  private readonly previewPool: Map<string, RegistryEntry> = new Map();

  public constructor(client: WebWorkerClient) {
    this.client = client;
  }

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

  public async uploadFile(file: File): Promise<void> {
    const res = await this.client.send("IO:SEND_FILE", { file }, [], 5000);
    console.log("File upload response: ", res);
  }
};

export { GraphIoManager };
