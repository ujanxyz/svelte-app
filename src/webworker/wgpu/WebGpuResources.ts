import {
  createFullscreenRectVertexBuffer,
} from "./wgpuCommon";

/**
 * Message object containing shared WebGPU resources reused across pipelines.
 */
export interface WebGpuResourcesMessage {
  device: GPUDevice;
  textureSampler: GPUSampler;
  fullscreenQuadVertexStripBuffer: GPUBuffer;
}

/**
 * Lazily initializes and caches shared WebGPU resources.
 *
 * The promise is stored so subsequent calls return the already-resolved result instantly.
 */
export class WebGpuResources {
  private adapter: GPUAdapter | null = null;
  private device: GPUDevice | null = null;
  private resourcesPromise: Promise<WebGpuResourcesMessage> | null = null;

  /**
   * Returns shared WebGPU resources.
   * First call initializes resources; subsequent calls reuse cached promise/result.
   */
  public getResources(): Promise<WebGpuResourcesMessage> {
    if (!this.resourcesPromise) {
      this.resourcesPromise = this.createResources();
    }
    return this.resourcesPromise;
  }

  private async createResources(): Promise<WebGpuResourcesMessage> {
    try {
      await this.initializeDevice();
      if (!this.device) {
        throw new Error("[WebGpuResources] Device initialization failed");
      }

      const device = this.device;
      const textureSampler = device.createSampler({
        magFilter: "linear",
        minFilter: "linear",
      });
      const fullscreenQuadVertexStripBuffer = createFullscreenRectVertexBuffer(device);
      return {
        device,
        textureSampler,
        fullscreenQuadVertexStripBuffer,
      };
    } catch (error) {
      // Allow retry on next call if initialization fails.
      this.resourcesPromise = null;
      throw error;
    }
  }

  /**
   * Initializes and stores adapter/device on the instance.
   */
  private async initializeDevice(): Promise<void> {
    const adapter = await navigator.gpu?.requestAdapter();
    if (!adapter) {
      throw new Error("[WebGpuResources] WebGPU not supported or adapter unavailable");
    }

    const device = await adapter.requestDevice();
    if (!device) {
      throw new Error("[WebGpuResources] Failed to request WebGPU device");
    }

    this.adapter = adapter;
    this.device = device;
  }
}
