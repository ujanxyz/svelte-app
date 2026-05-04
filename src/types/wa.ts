export namespace wa {

  type ApiInfoEntry = Record<"name", string> & Record<string, any>;

  export type ApiInstance = Record<string, Function> & {
    apis: ApiInfoEntry[];
  }

  export interface ApiResponse {
    data: Record<string, any>;
    ok: boolean;
    status: string;
  }

  /**
   * An asset staging is a temporary store where assets (like images, videos) are pre-converted
   * into ImageData formats (processed as mutable image) and held ready for consumption by the
   * WASM module.
   * The implementation lies in the WASM module  to be close to the C++ code (see the emscripten
   * pre-js script in the C++ repository) and this TypeScript interface helps to interact with
   * it from this module.
   */
  export interface AssetStagingInterface {
    /**
     * Stages an image to be consumed by the WASM module.
     *
     * @param assetUri The URI of the backing asset.
     * @param image The ImageData to be staged.
     * @param slotIdStr A string id specifying the expected consuming slot.
     */
    stageImageData(slotIdStr: string, assetUri: string, image: ImageData): void;

    /**
     * Releases a previously staged image upon request from the WASM module.
     * The image is removed from the staging area.
     * The image is looked up by the slot id, the asset is used to verify that
     * the image generated from the correct asset is being released.
     *
     * @param slotIdStr A string id specifying the expected consuming slot.
     * @param assetUri The URI of the backing asset.
     */
    releaseImageData(slotIdStr: string, assetUri: string): ImageData | null;

    /**
     * Cleans up all staged assets, e.g. on graph reset or when the worker is terminated.
     */
    clearAssets(): void;
  }

  export interface WasmModuleType {
    getBuildInfo: () => object;
    parseAbseilFlags: (args: string[]) => number;
    assetStaging: AssetStagingInterface;
    GraphEngineApi: { new (): wa.ApiInstance };
  }
}
