import type { fn } from "./function";
import type { plinfo } from "./plinfo";

export namespace apis {

  interface VoidType {};

  export interface ApiDict {
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
        nodeInfo: plinfo.NodeInfo;
        ins: plinfo.SlotInfo[];
        outs: plinfo.SlotInfo[];
        inouts: plinfo.SlotInfo[];
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
        edgeInfo: plinfo.EdgeInfo;
      }
    };
  
    deleteElements: {
      request: {
        nodeIds: string[];
        edgeIds: string[];
      };
      response: {
        nodeIds: string[];
        edgeIds: string[];
        topoOrder?: string[];
      }
    };
  };

  export type Names = keyof ApiDict;
  export type Request<K extends Names> = ApiDict[K]["request"];
  export type Response<K extends Names> = ApiDict[K]["response"];
}