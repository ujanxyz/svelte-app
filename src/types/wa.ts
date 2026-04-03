export namespace wa {
  type ApiInfoEntry = Record<"name", string> & Record<string, any>;

  export type ApiInstance = Record<string, Function> & {
    apis: ApiInfoEntry[];
  };

  export interface ApiResponse {
    data: Record<string, any>;
    ok: boolean;
    status: string;
  };

  export interface WasmModuleType {
    getBuildInfo: () => object;
    GraphEngineApi: { new (): wa.ApiInstance };
  }
}
