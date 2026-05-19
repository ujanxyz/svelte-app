/**
 * Fixed information and states for graph elements, like nodes, edges, slots.
 */
export namespace grph {

  export interface SlotId {
    parent: number;
    name: string;
  };

  // Encoded form of SlotId, used for communication with backend.
  // Here the node id is encoded by a 2-way cryptographic function.
  export interface EncodedSlotId {
    parent: string;
    name: string;
  };

  // See C++ repo -> //ujcore/graph
  export interface SlotInfo {
    parent: number;
    name: string;
    dtype: string;
    access: "I" | "O" | "M";
  };

  // See C++ repo -> //ujcore/graph
  export interface NodeInfo {
    rawId: number;
    alnumid: string;
    ntype: "FN" | "IN" | "OUT";  // Function, GraphIO (input/output)
    uri: string;
    // Slot names.
    ins: string[];
    outs: string[];
    inouts: string[];
  };

  // See C++ repo -> //ujcore/graph
  export interface EdgeInfo {
    id: number;
    catid: string;
    alnumNode0: string;
    alnumNode1: string;
    node0: number;
    node1: number;
    slot0: string;
    slot1: string;
  };

  // See C++ repo -> //ujcore/graph/ResourceInfo.h
  export interface BitmapInfo {
    id: string;
    backend: string;
    width: number;
    height: number;
    bytesPerPixel: number;
  };

  export interface ResourceInfo {
    type: "UNKNOWN" | "BITMAP";
    bitmap?: BitmapInfo;
  };

  // State related types.

  export interface EncodedData {
    payload: string;
  };

  export interface SlotState {
    inEdges: number[];
    outEdges: number[];
    encodedData: EncodedData | null;
    genId: number;
  }

  export interface NodeState {
    label: string;
    encodedData: EncodedData | null;
    connected: "WAIT" | "RUN" | "ERR";
    genId: number;
  }

  export interface GraphRunOutput {
    nodeId: number;
    dtype: string;
    encodedData: EncodedData | null;
  };

  export type SlotValidity = "VALID" | "WARN_DATA" | "ERR_TYPE" | "ERR_EDGE";
}
