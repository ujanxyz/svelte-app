import type { fn } from "./function";
import type { plinfo } from "./plinfo";
import type { plstate } from "./plstate";

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
        nodeInfo?: plinfo.NodeInfo;
        nodeState?: plstate.NodeState;
        inInfos: plinfo.SlotInfo[];
        outInfos: plinfo.SlotInfo[];
        inoutInfos: plinfo.SlotInfo[];
        inStates: plstate.SlotState[];
        outStates: plstate.SlotState[];
        inoutStates: plstate.SlotState[];
      };
    };

    createIONode: {
      request: {
        dtype: string;
        isOutput: boolean;
      };
      response: {
        nodeInfo?: plinfo.NodeInfo;
        nodeState?: plstate.NodeState;
        slotInfo?: plinfo.SlotInfo;
        slotState?: plstate.SlotState;
      };
    };
  
    addEdge: {
      request: {
        sourceNode: number;
        targetNode: number;
        sourceSlot: string;
        targetSlot: string;
      };
      response: {
        edgeInfo: plinfo.EdgeInfo;
        sourceState: plstate.SlotState;
        targetState: plstate.SlotState;
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
        deletedSlotIds: plinfo.SlotId[];
        affectedSlotIds: plinfo.SlotId[];
        topoOrder?: string[];
      };
    };

    getSlotStates: {
      request: {
        slotIds: plinfo.SlotId[];
      };
      response: {
        slotStates: [plinfo.SlotId, plstate.SlotState][];
      };
    };

    getAvailableFuncs: {
      request: VoidType;
      response: {
        infos: fn.FunctionInfo[];
      };
    };

    syncGraphInputs: {
      request: {
        updateData: [number /* nodeId */, string /* encoded */][];
        deleteIds: number[]; // nodeIds whose inputs are deleted
      };
      response: {
        inputData: [number /* nodeId */, string? /* encoded */][];
      };
    };

    runPipeline: {
      request: VoidType;
      response: VoidType;
    };

  };

  export type Names = keyof ApiDict;
  export type Request<K extends Names> = ApiDict[K]["request"];
  export type Response<K extends Names> = ApiDict[K]["response"];
}