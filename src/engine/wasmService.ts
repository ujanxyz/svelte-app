import type { HelloClassInstance, WasmModuleType } from "../types/WasmModule";

const GLUEJS_PATH = '/webassembly/entrypoint.js';

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

    public async initialize(): Promise<void> {
        if (this.wasmModule) return;
        if (this.initPromise) {
            return this.initPromise;
        }
        this.initPromise = this.loadWasm();
        return this.initPromise;
    }

    public async getGraphModule(): Promise<HelloClassInstance> {
        await this.initialize();
        return new (this.wasmModule as WasmModuleType).HelloClass("foobar");
    }

    private async loadWasm(): Promise<void> {
        try {
            this.wasmModule = await _loadWasmInternal();
        } catch (error) {
            this.wasmModule = undefined;
            throw error;
        }
    }
}

async function _loadWasmInternal(): Promise<WasmModuleType> {
    await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = GLUEJS_PATH;
        script.type = 'text/javascript';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = (error) => {
            console.error(error);
            reject(new Error(`Failed to load WASM glue code from ${GLUEJS_PATH}`));
        }
        document.head.appendChild(script);
    });

    const wasmModulePromise = (globalThis as any).CreateUjWasmModule() as Promise<WasmModuleType>;
    const wasmModule = await wasmModulePromise;
    console.assert(!!wasmModule, "WASM module should be loaded and available on globalThis.Module");
    console.log(wasmModule);
    console.log("Build info:", wasmModule.getBuildInfo());
    return wasmModule;
}

const wasmService = WasmService.getInstance();
export default wasmService;
