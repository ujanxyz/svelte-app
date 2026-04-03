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

  public async addEdge(request: apis.Request<"addEdge">): Promise<apis.Response<"addEdge">> {
    return await this.invokeAsync<"addEdge">("addEdge", request);
  }

  public async deleteElements(request: apis.Request<"deleteElements">): Promise<apis.Response<"deleteElements">> {
    return await this.invokeAsync<"deleteElements">("deleteElements", request);
  }

  // </ C++ apis> --------------------------------------------------------------

  private async invokeAsync<K extends apis.Names>(name: apis.Names, request: apis.Request<K>): Promise<apis.Response<K>> {
    const { ok, code, payload, error } = await this.#client.send(`GRAPH:${name}`, request);
    console.log(ok, code, payload, error);
    if (this.#deleted) throw new Error('builder deleted');
    if (!ok) {
      throw new Error(`${code}: ${error}`);
    }
    return payload! as apis.Response<K>;
  }
}

export { PipelineBuilder };
