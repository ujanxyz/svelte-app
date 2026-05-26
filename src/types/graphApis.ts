import type { grph } from "@/types/grph";

import type { fn } from "./function";

export namespace graphApis {

  interface VoidType {};

  export interface ApiDict {
    getGraphMeta: {
      request: VoidType;
      response: {
        lastNodeId: number;
        lastEdgeId: number;
      };
    };

    setGraphMeta: {
      request: {
        lastNodeId: number;
        lastEdgeId: number;
      };
      response: VoidType;
    };

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
        overrideId: string | null,
      };
      response: {
        nodeInfo?: grph.NodeInfo;
        nodeState?: grph.NodeState;
        inInfos: grph.SlotInfo[];
        outInfos: grph.SlotInfo[];
        inoutInfos: grph.SlotInfo[];
        inStates: grph.SlotState[];
        outStates: grph.SlotState[];
        inoutStates: grph.SlotState[];
      };
    };

    createIONode: {
      request: {
        dtype: string;
        isOutput: boolean;
        overrideId: string | null;
      };
      response: {
        nodeInfo?: grph.NodeInfo;
        nodeState?: grph.NodeState;
        slotInfo?: grph.SlotInfo;
        slotState?: grph.SlotState;
      };
    };

    addEdges: {
      request: {
        entries: {
          source: grph.EncodedSlotId;
          target: grph.EncodedSlotId;
          overrideEdgeId?: number;
        }[];
      };
      response: {
        edgeInfos: grph.EdgeInfo[];
      };
    };
  
    deleteElements: {
      request: {
        nodeIds: string[];
        edgeIds: string[];
      };
      response: {
        edgeIds: string[];
        deletedSlotIds: grph.EncodedSlotId[];
        affectedSlotIds: grph.EncodedSlotId[];
        topoOrder?: string[];
      };
    };

    validateEdge: {
      request: {
        source: grph.EncodedSlotId;
        target: grph.EncodedSlotId;
      };
      response: {
        validity: grph.SlotValidity;
      };
    };

    getNodeStates: {
      request: {
        nodeIds: string[];
      };
      response: {
        nodeStates: [string /* nodeId */, grph.NodeState][];
      };
    };

    getSlotStates: {
      request: {
        slotIds: grph.EncodedSlotId[];
      };
      response: {
        slotStates: [grph.EncodedSlotId, grph.SlotState][];
      };
    };

    getAvailableFuncs: {
      request: {
        filters: ("UNKNOWN" | "URI_LIST" | "PREFIX" | "PAGE")[];
        uriList?: string[];
        prefix?: string;
        pageStart?: number;
        pageSize?: number;
      };
      response: {
        infos: fn.FunctionInfo[];
      };
    };

    setEncodedData: {
      request: {
        slotId: grph.EncodedSlotId;
        encodedData: grph.EncodedData | null;
      };
      response: VoidType;
    };

  };

  export type Names = keyof ApiDict;
  export type Request<K extends Names> = ApiDict[K]["request"];
  export type Response<K extends Names> = ApiDict[K]["response"];
}