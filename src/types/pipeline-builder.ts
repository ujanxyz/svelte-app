import type { EngineApiRequest, EngineApiResponse } from "./wasm-types";

export interface PipelineBuilder {
  /** Create a new pipeline instance */
  //createPipeline(): number;
  //addNode(pipelineId: number, node: any): number;

  getGraph(request: EngineApiRequest<"getGraph">): Promise<EngineApiResponse<"getGraph">>;
  createNode(request: EngineApiRequest<"createNode">): Promise<EngineApiResponse<"createNode">>;
  addEdge(request: EngineApiRequest<"addEdge">): Promise<EngineApiResponse<"addEdge">>;
}
