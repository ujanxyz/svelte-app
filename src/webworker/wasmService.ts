import type { wa } from "@/types/wa.js";

import CreateUjWasmModule from "./wasm/entrypoint.js";

class WasmService {
  private static instance: WasmService | null = null;
  private initPromise: Promise<void> | null = null;
  private wasmModule?: wa.WasmModuleType;

  private constructor() {}

  public static getInstance(): WasmService {
    if (!WasmService.instance) {
      WasmService.instance = new WasmService();
    }
    return WasmService.instance;
  }

  // Pre-requisite: Loading is complete.
  public newGraphEngineApi(): wa.ApiInstance {
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
      const waModule: WebAssembly.Module = {
        preRun: [],
        postRun: [],
        print: (text: string) => console.log(text),
        printErr: (text: string) => console.error(text),
        myDemoFn: (x: number) => console.log("myDemoFn called with", x),
      };

      this.wasmModule = await _loadWasmInternal(waModule);
      this.#postLoadSteps(start);
    } catch (error) {
      this.wasmModule = undefined;
      throw error;
    }
  }

  #postLoadSteps(loadStartTime: number): void {
    const mod = this.wasmModule!;
    const now = Date.now();
    const legibleLoadingTime = `${now - loadStartTime} ms`;

    const numParsedFlags = mod.parseAbseilFlags(this.#makeAbseilFlags());
    const buildInfo = mod.getBuildInfo() as Record<string, any>;
    
    const infoObj: Record<string, any> = { ...buildInfo, legibleLoadingTime, numParsedFlags };
    if (buildInfo.timestamp) {
      infoObj.legibleBuildInstant = new Date(
        (buildInfo.timestamp as number) * 1000,
      ).toLocaleString();
    }
    console.log(infoObj);
  }

  #makeAbseilFlags(): string[] {
    const flags: string[] = [
      "binaryRef", // The 0-th arg is reserved for the binary ref, which is not consumed in flags.
      "--vmodule=PipelineRunner=1,PipelineIONode=1,PipelineFnNode=1,FloatListAttr=1",
    ];
    return flags;
  }
}

async function _loadWasmInternal(moduleArg: WebAssembly.Module): Promise<wa.WasmModuleType> {
  const wasmModulePromise = CreateUjWasmModule(moduleArg) as Promise<wa.WasmModuleType>;
  const wasmModule = await wasmModulePromise;
  console.assert(
    !!wasmModule,
    "WASM module should be loaded and available on globalThis.Module",
  );
  return wasmModule;
}

const wasmService = WasmService.getInstance();
export default wasmService;
