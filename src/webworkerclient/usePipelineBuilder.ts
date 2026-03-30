import MyWorker from "../webworker?worker";
import { WebWorkerClient } from "./WebWorkerClient";
import { WorkerPipelineBuilder } from "./WorkerPipelineBuilder";

function usePipelineBuilder(): WorkerPipelineBuilder {
  const rawWorker = new MyWorker({ name: "GraphWorker" });
  const client = new WebWorkerClient(rawWorker);
  return new WorkerPipelineBuilder(client);
}

export { usePipelineBuilder };
