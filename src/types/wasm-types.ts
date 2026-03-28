export interface WasmModuleType {
  getBuildInfo: () => object;
  GraphEngineApi: GraphEngineApiConstructor;
}

interface GraphEngineApiConstructor {
  new (): GraphEngineApiInstance;
}

export interface GraphEngineApiInstance {
  apis: Record<string, any>[];

  getGraph: (args: VoidType) => ApiResponse<"getGraph">;
}

interface ApiResponse<K extends keyof ResponseTypes> {
  data: ResponseTypes[K];
  ok: boolean;
  status: string;
}

type ResponseTypes = {
  getGraph: {
    nodes: any[];
    edges: any[];
    slots: any[];
  };

  // TODO: Add remaining apis matching the C++ backend.
  addNode: {
    newid: string;
  };
};

interface VoidType {}
