/**
 * plinfo: Pipeline state
 * Fixed information for pipeline elements: nodes, slots.
 */
export namespace plstate {
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
