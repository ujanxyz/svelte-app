import MyWorker from "../webworker?worker";
import { GraphIoManager } from "./GraphIoManager";
import { PipelineBuilder } from "./PipelineBuilder";
import { WebWorkerClient } from "./WebWorkerClient";

function useWebWorkerResources() {
  const rawWorker = new MyWorker({ name: "GraphWorker" });
  const workerClient = new WebWorkerClient(rawWorker);

  const pipeline = new PipelineBuilder(workerClient);
  const graphIo = new GraphIoManager(workerClient);

  function destroyWorker() {
    workerClient.destroy();
    rawWorker.terminate();
  }

  return { pipeline, graphIo, destroyWorker };
}

export { useWebWorkerResources };
