
/**
 * This attaches it to the global scope
 */
declare global {
  interface Window {
    CreateUjWasmModule: () => WasmModuleType;
  }
}

interface WasmModuleType {
    getBuildInfo: () => object;
    HelloClass: HelloClassConstructor;
};

interface HelloClassConstructor {
  new (name: string): HelloClassInstance;
}

interface HelloClassInstance {
  sayHello(): void;
  processData(input: number): number;
}

export { WasmModuleType, HelloClassInstance };