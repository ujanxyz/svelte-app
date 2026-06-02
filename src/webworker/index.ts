import { bootstrapAsWebWorker } from "@/bgtask/worker/bootstrap";
import type { bgtask } from "@/bgtask/worker/types";

import { AssetDbAwaitProcessor } from "./await-task/AssetDbAwaitProcessor";
import { AwaitProcessorSet } from "./await-task/AwaitProcessorSet";
import { CppApiPlugin } from "./CppApiPlugin";
import { WorkerIndexedDb } from "./db";
import { PreviewManager } from "./PreviewManager";
import wasmService from "./wasmService";
import { WebGpuAwaitProcessor } from "./wgpu/WebGpuAwaitProcessor";
import { WorkerIoManager } from "./WorkerIoManager";

async function onInitWorker(): Promise<bgtask.host.BgTaskPlugin[]> {
  await wasmService.awaitLoadComplete();
  const wasmAttachments = wasmService.getAttachments();
  const indexedDb = new WorkerIndexedDb({ idleCloseMs: 60_000 });
  console.log("[Worker] WASM attachments obtained:", wasmAttachments);

  const graphApi = new CppApiPlugin("GRAPH", wasmService.newBackendApi("GraphApi"));
  const flowApi = new CppApiPlugin("FLOW", wasmService.newBackendApi("FlowApi"));

  const previewManager = new PreviewManager();

  const awaitProc = new AwaitProcessorSet(wasmAttachments.awaitPool);
  awaitProc.assignProcessors([
    new AssetDbAwaitProcessor(indexedDb, previewManager),
    new WebGpuAwaitProcessor(),
  ]);

  const ioManager = new WorkerIoManager(awaitProc, previewManager, indexedDb, (globalThis as any).pipelineEvents as EventTarget);
  return [graphApi, flowApi, ioManager];
}

await bootstrapAsWebWorker(globalThis, onInitWorker);
