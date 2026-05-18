import type { AwaitTaskChannel } from "@/webworker/await-task/AwaitTaskChannel";

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

  //-----------------------------------------------------------------------------------------------
  // WgpuTaskPoolInterface related types.

  /**
   * Entry representing a pending or fulfilled WebGPU task.
   */
  export interface PendingWebGpuTaskEntry {
      workId: string;
      taskData: object;
      resultData: object | null;
      fulfilled: boolean;
      createdAtMs: number;
      fulfilledAtMs: number | null;
  };

  /**
   * Interface for a awaiter task pool channel shared between C++ execution nodes and JS code.
   * Entries are keyed by work id. Work items are inserted by C++ execution nodes,
   * and fulfilled by the coordinating JS code that performs the GPU work in native JS
   * and resolves the pending status.
   */
  export interface WgpuTaskPoolInterface {
      /**
       * The name of this channel.
       */
      channelName: string;

      /**
       * Register a pending WebGPU task and return its generated work id.
       * @param taskData Opaque task description passed from C++ or JS bridge code.
       * @returns Unique work id for later fulfillment.
       */
      registerTask(taskData: object): string;

      /**
       * Fulfill a previously registered task with result data.
       * @param workId Task id returned from registerTask.
       * @param resultData Opaque result payload produced by JS-side GPU execution.
       */
      fulfillTask(workId: string, resultData: object): void;

      /**
       * Get the original task data for a registered task.
       * @param workId Task id returned from registerTask.
       * @returns Original task payload, or null if not found.
       */
      getTaskData(workId: string): object | null;

      /**
       * Peeks the result data for a fulfilled task, not removing it from the pool.
       * @param workId Task id returned from registerTask.
       * @returns Fulfillment payload, or null if missing/unfulfilled.
       */
      peekResultData(workId: string): object | null;

      /**
       * Releases and removes the result data for a fulfilled task.
       * This also removes the entire task entry from the pool, since once the result
       * is consumed, the task is fully complete and can be forgotten.
       *
       * @param workId Task id returned from registerTask.
       * @param forceDelete If true, the task entry is removed even if it is not
       * fulfilled yet. Use with caution as this may lead to lost work or orphaned
       * tasks if used incorrectly.
       * @returns Fulfillment payload, or null if missing / unfulfilled.
       */
      releaseResultData(workId: string, forceDelete?: boolean): object | null;

      /**
       * Return the ids of tasks that are still pending fulfillment.
       * @returns Pending work ids.
       */
      getPendingTaskIds(): string[];

      /**
       * Remove a task from the pool and return its full entry.
       * Useful once C++ has consumed the completed result.
       * @param workId Task id returned from registerTask.
       * @returns Removed task entry, or null if not found.
       */
      takeTask(workId: string): object | null;

      /**
       * Clear all registered tasks, e.g. on graph reset or worker shutdown.
       */
      clearTasks(): void;
  };

  //-----------------------------------------------------------------------------------------------
  /**
   * Pool of named task channels used as the JS <-> WASM exchange point.
   */
  export interface AwaitTaskPoolInterface {
  
    /** Adds a task to a named channel and returns the created task id. */
    addTask(channel: string, taskData: object): string;
  
    /** Returns fulfilled result data without removing it from the channel. */
    peekResult(channel: string, taskId: string): object | null;
  
    /**
     * Returns fulfilled result data and releases channel entry.
     * forceDelete removes task metadata even if no result is available.
     */
    releaseResult(channel: string, taskId: string, forceDelete?: boolean): object | null;
  
    /** Registers a named channel implementation. */
    registerChannel(channelName: string, channel: AwaitTaskChannel<any, any>): void;
  };
  

  //-----------------------------------------------------------------------------------------------
  // The following are the types related to the WASM module and its APIs.

  type ApiClass = { new (): ApiInstance };

  export interface WasmApiSet {
    FlowApi: ApiClass;
    GraphApi: ApiClass;
  }

  export interface WasmAttachments {
    assetStaging: AssetStagingInterface;
    wgpuTaskPool: WgpuTaskPoolInterface;
    awaitPool: AwaitTaskPoolInterface;
  }

  export interface WasmModuleType extends WasmApiSet, WasmAttachments {
    getBuildInfo: () => object;
    parseAbseilFlags: (args: string[]) => number;
  }
}
