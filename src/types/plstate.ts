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
    manual: EncodedData | null;
    genId: number;
  }

  export interface NodeState {
    label: string;
    ioData: EncodedData | null;
    connected: "WAIT" | "RUN" | "ERR";
    genId: number;
  }
}
