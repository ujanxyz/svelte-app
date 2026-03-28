import type { EngineApiRequest, EngineApiResponse } from "@/types/wasm-types";

import type { WebWorkerClient } from "./WebWorkerClient";

class RemoteGraphBuilder {
  private readonly client: WebWorkerClient;

  public constructor(client: WebWorkerClient) {
    this.client = client;
  }

  public async getGraph(request: EngineApiRequest<"getGraph">): Promise<EngineApiResponse<"getGraph">> {
    const { ok, code, payload, error } = await this.client.send("GRAPH:getGraph", request);
    console.log(ok, code, payload, error);
    if (!ok) {
      throw new Error(`${code}: ${error}`);
    }
    return payload! as EngineApiResponse<"getGraph">;
  }

  public async createNode(request: EngineApiRequest<"createNode">): Promise<EngineApiResponse<"createNode">> {
    const { ok, code, payload, error } = await this.client.send("GRAPH:createNode", request);
    console.log(ok, code, payload, error);
    if (!ok) {
      throw new Error(`${code}: ${error}`);
    }
    return payload! as EngineApiResponse<"createNode">;
  }
  
  public async addEdges(request: EngineApiRequest<"addEdges">): Promise<EngineApiResponse<"addEdges">> {
    console.log("request of addEdges ~~~~~ ", request);
    const { ok, code, payload, error } = await this.client.send("GRAPH:addEdges", request);
    console.log(ok, code, payload, error);
    if (!ok) {
      throw new Error(`${code}: ${error}`);
    }
    return payload! as EngineApiResponse<"addEdges">;
  }
  
}

export { RemoteGraphBuilder };
