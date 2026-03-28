import {
  type GraphEngineApiInstance,
  type WasmModuleType,
} from "@/types/wasm-types.js";

import CreateUjWasmModule from "./wasm/entrypoint.js";

class WasmService {
  private static instance: WasmService | null = null;
  private initPromise: Promise<void> | null = null;
  private wasmModule?: WasmModuleType;

  private constructor() {}

  public static getInstance(): WasmService {
    if (!WasmService.instance) {
      WasmService.instance = new WasmService();
    }
    return WasmService.instance;
  }

  // Pre-requisite: Loading is complete.
  public newGraphEngineApi(): GraphEngineApiInstance {
    if (!this.wasmModule) {
      throw new Error("wasmModule not loaded");
    }
    const mod = this.wasmModule!;
    return new mod.GraphEngineApi();
  }

  // Trigger loading and forget.
  public beginLoading(): void {
    this.awaitLoadComplete();
  }

  // Async method that returns after load is complete.
  public async awaitLoadComplete(): Promise<void> {
    if (this.wasmModule) return;
    if (this.initPromise) {
      return this.initPromise;
    }
    this.initPromise = this.#loadWasm();
    return this.initPromise;
  }

  async #loadWasm(): Promise<void> {
    const start = Date.now();
    try {
      this.wasmModule = await _loadWasmInternal();
      this.#postLoadSteps(start);
    } catch (error) {
      this.wasmModule = undefined;
      throw error;
    }
  }

  #postLoadSteps(loadStartTime: number): void {
    const mod = this.wasmModule!;
    const now = Date.now();
    const buildInfo = mod.getBuildInfo() as Record<string, any>;
    const infoObj = { ...buildInfo };
    infoObj["legibleLoadingTime"] = `${now - loadStartTime} ms`;
    if (buildInfo.timestamp) {
      infoObj["legibleBuildInstant"] = new Date(
        (buildInfo.timestamp as number) * 1000,
      ).toLocaleString();
    }
    console.log(infoObj);
  }
}

async function _loadWasmInternal(): Promise<WasmModuleType> {
  const wasmModulePromise = CreateUjWasmModule() as Promise<WasmModuleType>;
  const wasmModule = await wasmModulePromise;
  console.assert(
    !!wasmModule,
    "WASM module should be loaded and available on globalThis.Module",
  );
  return wasmModule;
}

const wasmService = WasmService.getInstance();
export default wasmService;
