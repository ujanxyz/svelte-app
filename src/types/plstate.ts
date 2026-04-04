/**
 * plinfo: Pipeline state
 * Fixed information for pipeline elements: nodes, slots.
 */
export namespace plstate {

  export interface SlotState {
    inEdges: number[];
    outEdges: number[];
    genId: number;
  }

  export interface NodeState {
    label: string;
    connected: "WAIT" | "RUN" | "ERR";
    genId: number;
  }
}
