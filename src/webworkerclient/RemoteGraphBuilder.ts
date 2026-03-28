import type { WebWorkerClient } from "./WebWorkerClient";

class RemoteGraphBuilder {
  private readonly client: WebWorkerClient;

  public constructor(client: WebWorkerClient) {
    this.client = client;
  }

  public async sendTestMessage() {
    const resp = await this.client.send("GRAPH:getgraph", {});
    console.log(resp);
  }

}

export { RemoteGraphBuilder };