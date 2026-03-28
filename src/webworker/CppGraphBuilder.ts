import { type GraphEngineApiInstance } from "@/types/wasm-types";

class CppGraphBuilder {
  private readonly graph: GraphEngineApiInstance;

  public constructor(graph: GraphEngineApiInstance) {
    this.graph = graph;
    console.log("Available C++ apis:", this.graph.apis);
  }

  public async process(code: string, request: Record<string, any>): Promise<Error | Record<string, any>> {
    switch (code) {
      case "GRAPH:getgraph":
        const { data, ok, status } = this.graph.getGraph({});
        return ok ? data : new Error(status);
    }
    return new Error(`Invalid message code: ${code}`);
  }
}

export { CppGraphBuilder };
