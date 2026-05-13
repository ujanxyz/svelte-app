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

    encodeGraph: {
      request: VoidType;
      response: string;
    };

    decodeGraph: {
      request: string;
      response: VoidType;
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
        slotStates: [grph.SlotId, grph.SlotState][];
      };
    };
  
    deleteElements: {
      request: {
        nodeIds: number[];
        edgeIds: number[];
      };
      response: {
        nodeIds: number[];
        edgeIds: number[];
        deletedSlotIds: grph.SlotId[];
        affectedSlotIds: grph.SlotId[];
        topoOrder?: string[];
      };
    };

    validateEdge: {
      request: {
        sourceNode: number;
        sourceSlot: string;
        targetNode: number;
        targetSlot: string;
      };
      response: {
        validity: grph.SlotValidity;
      };
    };

    getNodeStates: {
      request: {
        nodeIds: number[];
      };
      response: {
        nodeStates: [number /* nodeId */, grph.NodeState][];
      };
    };

    getSlotStates: {
      request: {
        slotIds: grph.SlotId[];
        slotIdsEncoded: grph.EncodedSlotId[];
      };
      response: {
        slotStates: [grph.SlotId, grph.SlotState][];
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
        isNode: boolean;
        nodeId: number | null;
        slotId: grph.SlotId | null;
        encodedData: grph.EncodedData | null;
      };
      response: VoidType;
    };

    buildPipeline: {
      request: VoidType;
      response: {
        assetInfos: grph.AssetInfo[];
      };
    };

    runPipeline: {
      request: VoidType;
      response: {
        runResult: grph.GraphRunOutput[];
      };
    };

    getResources: {
      request: VoidType;
      response: {
        resources: grph.ResourceInfo[];
      };
    };

  };

  export type Names = keyof ApiDict;
  export type Request<K extends Names> = ApiDict[K]["request"];
  export type Response<K extends Names> = ApiDict[K]["response"];
}