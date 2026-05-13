import { type flowApis } from "@/types/flowApis";

import type { WebWorkerClient } from "./WebWorkerClient";

class FlowWorkerApi {
  public static CONTEXT_KEY = Symbol.for("flow");
  readonly client: WebWorkerClient;

  public constructor(client: WebWorkerClient) {
    this.client = client;
  }

  public async getFlowStatus(request: flowApis.Request<"getFlowStatus">): Promise<flowApis.Response<"getFlowStatus">> {
    return await this.invokeAsync<"getFlowStatus">("getFlowStatus", request);
  }

  public async buildPipeline(request: flowApis.Request<"buildPipeline">): Promise<flowApis.Response<"buildPipeline">> {
    return await this.invokeAsync<"buildPipeline">("buildPipeline", request);
  }

  private async invokeAsync<K extends flowApis.Names>(name: K, request: flowApis.Request<K>): Promise<flowApis.Response<K>> {
    const { ok, code, payload, error } = await this.client.send(`FLOW:${name}`, request, []);
    if (!ok) {
      throw new Error(`${code}: ${error}`);
    }
    return payload! as flowApis.Response<K>;
  }
}

export { FlowWorkerApi };
