import type { PipelineBuilder } from "@/types/pipeline-builder";
import type { EngineApiRequest, EngineApiResponse } from "@/types/wasm-types";

import type { WebWorkerClient } from "./WebWorkerClient";

class WorkerPipelineBuilder implements PipelineBuilder {
  readonly #client: WebWorkerClient;
  #deleted: boolean = false;

  public constructor(client: WebWorkerClient) {
    this.#client = client;
  }

  public destroy(): void {
    this.#client.destroy();
  }

  public async getGraph(request: EngineApiRequest<"getGraph">): Promise<EngineApiResponse<"getGraph">> {
    const { ok, code, payload, error } = await this.#client.send("GRAPH:getGraph", request);
    console.log(ok, code, payload, error);
    this.#ensureNotDeleted();
    if (!ok) {
      throw new Error(`${code}: ${error}`);
    }
    return payload! as EngineApiResponse<"getGraph">;
  }

  public async createNode(request: EngineApiRequest<"createNode">): Promise<EngineApiResponse<"createNode">> {
    const { ok, code, payload, error } = await this.#client.send("GRAPH:createNode", request);
    console.log(ok, code, payload, error);
    this.#ensureNotDeleted();
    if (!ok) {
      throw new Error(`${code}: ${error}`);
    }
    return payload! as EngineApiResponse<"createNode">;
  }

  public async addEdge(request: EngineApiRequest<"addEdge">): Promise<EngineApiResponse<"addEdge">> {
    console.log("request of addEdge ~~~~~ ", request);
    const { ok, code, payload, error } = await this.#client.send("GRAPH:addEdge", request);
    console.log(ok, code, payload, error);
    this.#ensureNotDeleted();
    if (!ok) {
      throw new Error(`${code}: ${error}`);
    }
    return payload! as EngineApiResponse<"addEdge">;
  }

  public async addEdges(request: EngineApiRequest<"addEdges">): Promise<EngineApiResponse<"addEdges">> {
    console.log("request of addEdges ~~~~~ ", request);
    const { ok, code, payload, error } = await this.#client.send("GRAPH:addEdges", request);
    console.log(ok, code, payload, error);
    this.#ensureNotDeleted();
    if (!ok) {
      throw new Error(`${code}: ${error}`);
    }
    return payload! as EngineApiResponse<"addEdges">;
  }

  #ensureNotDeleted(): void {
    if (this.#deleted) throw new Error('builder deleted');
  }
}

export { WorkerPipelineBuilder };
