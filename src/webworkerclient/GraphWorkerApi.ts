import { type graphApis } from "@/types/graphApis";

import type { WebWorkerClient } from "./WebWorkerClient";

class GraphWorkerApi {
  public static CONTEXT_KEY = Symbol.for("graph");
  readonly client: WebWorkerClient;

  public constructor(client: WebWorkerClient) {
    this.client = client;
  }

  public async getGraphMeta(request: graphApis.Request<"getGraphMeta">): Promise<graphApis.Response<"getGraphMeta">> {
    return await this.invokeAsync<"getGraphMeta">("getGraphMeta", request);
  }

  public async setGraphMeta(request: graphApis.Request<"setGraphMeta">): Promise<graphApis.Response<"setGraphMeta">> {
    return await this.invokeAsync<"setGraphMeta">("setGraphMeta", request);
  }

  public async getGraph(request: graphApis.Request<"getGraph">): Promise<graphApis.Response<"getGraph">> {
    return await this.invokeAsync<"getGraph">("getGraph", request);
  }

  public async createNode(request: graphApis.Request<"createNode">): Promise<graphApis.Response<"createNode">> {
    return await this.invokeAsync<"createNode">("createNode", request);
  }

  public async createIONode(request: graphApis.Request<"createIONode">): Promise<graphApis.Response<"createIONode">> {
    return await this.invokeAsync<"createIONode">("createIONode", request);
  }

  public async addEdges(request: graphApis.Request<"addEdges">): Promise<graphApis.Response<"addEdges">> {
    return await this.invokeAsync<"addEdges">("addEdges", request);
  }

  public async deleteElements(request: graphApis.Request<"deleteElements">): Promise<graphApis.Response<"deleteElements">> {
    return await this.invokeAsync<"deleteElements">("deleteElements", request);
  }

  public async validateEdge(request: graphApis.Request<"validateEdge">): Promise<graphApis.Response<"validateEdge">> {
    return await this.invokeAsync<"validateEdge">("validateEdge", request);
  }

  public async getNodeStates(request: graphApis.Request<"getNodeStates">): Promise<graphApis.Response<"getNodeStates">> {
    return await this.invokeAsync<"getNodeStates">("getNodeStates", request);
  }

  public async getSlotStates(request: graphApis.Request<"getSlotStates">): Promise<graphApis.Response<"getSlotStates">> {
    return await this.invokeAsync<"getSlotStates">("getSlotStates", request);
  }

  public async getAvailableFuncs(request: graphApis.Request<"getAvailableFuncs">): Promise<graphApis.Response<"getAvailableFuncs">> {
    return await this.invokeAsync<"getAvailableFuncs">("getAvailableFuncs", request);
  }

  public async setEncodedData(request: graphApis.Request<"setEncodedData">): Promise<graphApis.Response<"setEncodedData">> {
    return await this.invokeAsync<"setEncodedData">("setEncodedData", request);
  }

  private async invokeAsync<K extends graphApis.Names>(name: K, request: graphApis.Request<K>): Promise<graphApis.Response<K>> {
    const { ok, code, payload, error } = await this.client.send(`GRAPH:${name}`, request, []);
    if (!ok) {
      throw new Error(`${code}: ${error}`);
    }
    return payload! as graphApis.Response<K>;
  }
}

export { GraphWorkerApi };
