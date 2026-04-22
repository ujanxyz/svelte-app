import { type apis } from "@/types/apis";

import type { WebWorkerClient } from "./WebWorkerClient";

class PipelineBuilder {
  readonly #client: WebWorkerClient;
  #deleted: boolean = false;

  public constructor(client: WebWorkerClient) {
    this.#client = client;
  }

  public destroy(): void {
    this.#client.destroy();
  }

  // < C++ apis> ---------------------------------------------------------------

  public async getGraph(request: apis.Request<"getGraph">): Promise<apis.Response<"getGraph">> {
    return await this.invokeAsync<"getGraph">("getGraph", request);
  }

  public async createNode(request: apis.Request<"createNode">): Promise<apis.Response<"createNode">> {
    return await this.invokeAsync<"createNode">("createNode", request);
  }

  public async createIONode(request: apis.Request<"createIONode">): Promise<apis.Response<"createIONode">> {
    return await this.invokeAsync<"createIONode">("createIONode", request);
  }

  public async addEdge(request: apis.Request<"addEdge">): Promise<apis.Response<"addEdge">> {
    return await this.invokeAsync<"addEdge">("addEdge", request);
  }

  public async deleteElements(request: apis.Request<"deleteElements">): Promise<apis.Response<"deleteElements">> {
    return await this.invokeAsync<"deleteElements">("deleteElements", request);
  }

  public async getNodeStates(request: apis.Request<"getNodeStates">): Promise<apis.Response<"getNodeStates">> {
    return await this.invokeAsync<"getNodeStates">("getNodeStates", request);
  }

  public async getSlotStates(request: apis.Request<"getSlotStates">): Promise<apis.Response<"getSlotStates">> {
    return await this.invokeAsync<"getSlotStates">("getSlotStates", request);
  }


  public async getAvailableFuncs(request: apis.Request<"getAvailableFuncs">): Promise<apis.Response<"getAvailableFuncs">> {
    return await this.invokeAsync<"getAvailableFuncs">("getAvailableFuncs", request);
  }

  public async syncGraphInputs(request: apis.Request<"syncGraphInputs">): Promise<apis.Response<"syncGraphInputs">> {
    return await this.invokeAsync<"syncGraphInputs">("syncGraphInputs", request);
  }

  public async runPipeline(request: apis.Request<"runPipeline">): Promise<apis.Response<"runPipeline">> {
    return await this.invokeAsync<"runPipeline">("runPipeline", request);
  }

  // </ C++ apis> --------------------------------------------------------------

  private async invokeAsync<K extends apis.Names>(name: apis.Names, request: apis.Request<K>): Promise<apis.Response<K>> {
    const { ok, code, payload, error } = await this.#client.send(`GRAPH:${name}`, request);
    // console.log(ok, code, payload, error);
    if (this.#deleted) throw new Error('builder deleted');
    if (!ok) {
      throw new Error(`${code}: ${error}`);
    }
    return payload! as apis.Response<K>;
  }
}

export { PipelineBuilder };
