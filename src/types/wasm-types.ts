export interface WasmModuleType {
  getBuildInfo: () => object;
  GraphEngineApi: GraphEngineApiConstructor;
}

interface GraphEngineApiConstructor {
  new (): GraphEngineApiInstance;
}

interface WasmApiResponse<K extends keyof EngineApiTypes> {
  data: EngineApiResponse<K>;
  ok: boolean;
  status: string;
};

export interface GraphEngineApiInstance {
  apis: Record<string, any>[];

  getGraph: (args: EngineApiRequest<"getGraph">) => WasmApiResponse<"getGraph">;
  createNode: (args: EngineApiRequest<"createNode">) => WasmApiResponse<"createNode">;
  addEdges: (args: EngineApiRequest<"addEdges">) => WasmApiResponse<"addEdges">;
}

interface VoidType {}

export interface EngineApiTypes {
  getGraph: {
    request: VoidType;
    response: {
      nodes: any[];
      edges: any[];
      slots: any[];
    };
  };

  createNode: {
    request: string;
    response: {
      node: any;
      edges: any[];
    };
  };

  addEdges: {
    request: {
      entries: {
        node0: string;
        slot0: string;
        node1: string;
        slot1: string;
      }[];
    };
    response: {
      edges: any[];
    }
  };
};

export type EngineApiRequest<K extends keyof EngineApiTypes> = EngineApiTypes[K]["request"];
export type EngineApiResponse<K extends keyof EngineApiTypes> = EngineApiTypes[K]["response"];