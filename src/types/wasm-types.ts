import type { fn } from "./function";

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
  addEdge: (args: EngineApiRequest<"addEdge">) => WasmApiResponse<"addEdge">;
  addEdges: (args: EngineApiRequest<"addEdges">) => WasmApiResponse<"addEdges">;
}

interface VoidType {}

export interface EngineApiTypes {
  getGraph: {
    request: VoidType;
    response: {
      nodeInfos: any[];
      edgeInfos: any[];
      slotInfos: any[];
    };
  };

  createNode: {
    request: {
      func: fn.FunctionInfo,
    };
    response: {
      node: any;
      edges: any[];
    };
  };

  addEdge: {
    request: {
      sourceNode: string;
      sourceSlot: string;
      targetNode: string;
      targetSlot: string;
    };
    response: {
      edgeInfo: any;
    }
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