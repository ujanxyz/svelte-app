import { type GraphEngineApiInstance } from "@/types/wasm-types";

class CppGraphBuilder {
  private readonly graph: GraphEngineApiInstance;

  public constructor(graph: GraphEngineApiInstance) {
    this.graph = graph;
    console.log("Available C++ apis:", this.graph.apis);
  }

  public async process(code: string, request: any): Promise<Error | Record<string, any>> {
    switch (code) {
      case "GRAPH:getGraph": {
        const { data, ok, status } = this.graph.getGraph(request);
        return ok ? data : new Error(status);
      }
      case "GRAPH:createNode": {
        const { data, ok, status } = this.graph.createNode(request);
        return ok ? data : new Error(status);
      }
      case "GRAPH:addEdges": {
        const { data, ok, status } = this.graph.addEdges(request);
        return ok ? data : new Error(status);
      }


    }

    return new Error(`Invalid message code: ${code}`);
  }
}

export { CppGraphBuilder };
