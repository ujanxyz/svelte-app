interface CmdGetGraph {
  cmd: "getgraph";
  getSlots?: boolean;
}

interface CmdAddNode {
  cmd: "addnode";
  fn: string;
}

interface CmdAddEdge {
  cmd: "addedge";
  entries: string[];
}

type PipelineCmd = CmdGetGraph | CmdAddNode | CmdAddEdge;

export interface PipelineAPI {
  /** Initialize WASM module (called once globally) */
  initialize(): Promise<void>;

  /** Create a new pipeline instance */
  createPipeline(): number;

  /** Destroy pipeline instance */
  destroyPipeline(pipelineId: number): void;

  /** Add node to pipeline */
  addNode(pipelineId: number, node: any): number;

  /** Add edge */
  addEdge(pipelineId: number, edge: any): void;

  /** Get full graph */
  getGraph(pipelineId: number): any;

  /** Evaluate pipeline */
  evaluate(pipelineId: number): any;

  /** Optional cleanup */
  reset(): void;
}
