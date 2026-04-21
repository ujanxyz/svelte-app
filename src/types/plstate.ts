/**
 * plinfo: Pipeline state
 * Fixed information for pipeline elements: nodes, slots.
 */
export namespace plstate {

  export interface SlotDataManual {
    dtype: string;
    encoded: string;
  }

  export interface SlotState {
    inEdges: number[];
    outEdges: number[];
    manual?: SlotDataManual;
    genId: number;
  }

  export interface NodeState {
    label: string;
    connected: "WAIT" | "RUN" | "ERR";
    genId: number;
  }
}
