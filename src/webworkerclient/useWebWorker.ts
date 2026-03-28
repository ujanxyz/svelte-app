import MyWorker from "../webworker?worker";
import { RemoteGraphBuilder } from "./RemoteGraphBuilder";
import { WebWorkerClient } from "./WebWorkerClient";

function useWebWorker() {
  const rawWorker = new MyWorker({ name: "GraphWorker" });
  const client = new WebWorkerClient(rawWorker);
  const remoteBuilder = new RemoteGraphBuilder(client);
  return { remoteBuilder };
}

export { useWebWorker };
