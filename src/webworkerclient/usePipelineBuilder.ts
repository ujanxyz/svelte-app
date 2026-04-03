import MyWorker from "../webworker?worker";
import { PipelineBuilder } from "./PipelineBuilder";
import { WebWorkerClient } from "./WebWorkerClient";

function usePipelineBuilder(): PipelineBuilder {
  const rawWorker = new MyWorker({ name: "GraphWorker" });
  const client = new WebWorkerClient(rawWorker);
  return new PipelineBuilder(client);
}

export { usePipelineBuilder };
