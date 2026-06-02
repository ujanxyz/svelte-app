export namespace bgtask.host {
  export type WrokerScope = typeof globalThis;

  export interface PluginProcessResult extends Record<string, any> {
    transfer?: Transferable[];
  };

  export type BgTaskPlugin = {
    prefix: string;
    onProcess(code: string, payload: unknown): Promise<PluginProcessResult>;
  };

  export interface RawWorkerResponse {
    ack: bigint;
    ok: boolean;
    code: string; // Always "OK" on success.
    reqcode?: string;
    payload?: Record<string, any>; // If ok
    error?: string; // If !ok
  }
}
