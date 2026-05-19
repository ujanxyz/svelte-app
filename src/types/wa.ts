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
    awaitPool: AwaitTaskPoolInterface;
  }

  export interface WasmModuleType extends WasmApiSet, WasmAttachments {
    getBuildInfo: () => object;
    parseAbseilFlags: (args: string[]) => number;
  }
}
