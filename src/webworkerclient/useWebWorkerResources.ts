import MyWorker from "../webworker?worker";
import { FlowWorkerApi } from "./FlowWorkerApi";
import { GraphWorkerApi } from "./GraphWorkerApi";
import { IoWorkerApi } from "./IoWorkerApi";
import { WebWorkerClient } from "./WebWorkerClient";

function useWebWorkerResources() {
  const rawWorker = new MyWorker({ name: "GraphWorker" });
  const workerClient = new WebWorkerClient(rawWorker);

  const flow = new FlowWorkerApi(workerClient);
  const graph = new GraphWorkerApi(workerClient);
  const io = new IoWorkerApi(workerClient);

  function destroyWorker() {
    workerClient.destroy();
    rawWorker.terminate();
  }

  return { flow, graph, io, destroyWorker };
}

export { useWebWorkerResources };
