import {
  type RawWorkerResponse,
  type SecureMessage,
} from "@/types/worker-message-types";

import { AssetDbAwaitProcessor } from "./await-task/AssetDbAwaitProcessor";
import { AwaitProcessorSet } from "./await-task/AwaitProcessorSet";
import { CppBackendApi } from "./CppBackendApi";
import { WorkerIndexedDb } from "./db/index";
import { PreviewManager } from "./PreviewManager";
import wasmService from "./wasmService";
import { WebGpuAwaitProcessor } from "./wgpu/WebGpuAwaitProcessor";
import { type IoProcessResult, WorkerIoManager } from "./WorkerIoManager";

const SysCodes = Object.freeze({
  OK: "_OK",
  IAM_READY: "_IAM_READY",
  NOT_READY: "_NOT_READY",
  SYNC_GAP: "_SYNC_GAP",
  UNKNOWN_CODE: "_UNKNOWN_CODE",
  APP_THROW: "_APP_THROW",
  APP_ERROR: "_APP_ERROR",
});

let graphApi: CppBackendApi | null = null;
let flowApi: CppBackendApi | null = null;

let awaitProc: AwaitProcessorSet | null = null;

let ioManager: WorkerIoManager | null = null;


const postman = _createPostman();

//-----------------------------------------------------------------------------
const { markHandlerReady, handlePostEvent } = (function createPostHandler() {
  let isThisWorkerReady = false;
  let expectedSeq: bigint = 0n;

  function markHandlerReady() {
    const wasmAttachments = wasmService.getAttachments();
    const indexedDb = new WorkerIndexedDb({ idleCloseMs: 60_000 });
    console.log("[Worker] WASM attachments obtained:", wasmAttachments);

    graphApi = new CppBackendApi("GRAPH", wasmService.newBackendApi("GraphApi"));
    flowApi = new CppBackendApi("FLOW", wasmService.newBackendApi("FlowApi"));

    const previewManager = new PreviewManager();
  
    awaitProc = new AwaitProcessorSet(wasmAttachments.awaitPool);
    awaitProc.assignProcessors([
      new AssetDbAwaitProcessor(indexedDb, previewManager),
      new WebGpuAwaitProcessor(),
    ]);

    ioManager = new WorkerIoManager(awaitProc, previewManager, indexedDb, (globalThis as any).pipelineEvents as EventTarget);

    isThisWorkerReady = true;
    postman.postImReady();
  }

  async function handlePostEvent(
    event: MessageEvent<SecureMessage>,
  ): Promise<void> {
    const { seq, code, payload } = event.data;

    if (!isThisWorkerReady) {
      postman.postError(
        seq,
        code,
        SysCodes.NOT_READY,
        "WASM module is still loading.",
      );
      return;
    }

    // Sequence detection: Check for lost messages
    if (seq !== expectedSeq) {
      const errorMsg = `Sync Error: Expected ${expectedSeq}, received ${seq}`;
      console.error(`[Worker] ${errorMsg}`);
      postman.postError(seq, code, SysCodes.SYNC_GAP, errorMsg);
      return;
    }

    try {
      if (graphApi!.matchesPrefix(code)) {
        const response = await graphApi!.process(code, payload);
        if (response instanceof Error) {
          const errmsg = (response as Error).message;
          console.warn(seq, code, SysCodes.APP_ERROR, errmsg);
          postman.postError(seq, code, SysCodes.APP_ERROR, errmsg);
        } else {
          console.log(`[Worker] Rooundtrip GRAPH (Seq: ${seq}, Code: ${code}): `, payload, response);
          postman.postResponse(seq, code, response!);
        }
      } else if (flowApi!.matchesPrefix(code)) {
        const response = await flowApi!.process(code, payload);
        if (response instanceof Error) {
          const errmsg = (response as Error).message;
          console.warn(seq, code, SysCodes.APP_ERROR, errmsg);
          postman.postError(seq, code, SysCodes.APP_ERROR, errmsg);
        } else {
          console.log(`[Worker] Rooundtrip FLOW (Seq: ${seq}, Code: ${code}): `, payload, response);
          postman.postResponse(seq, code, response!);
        }
      } else if (code.startsWith(WorkerIoManager.CMD_PREFIX)) {
        let response = await ioManager!.process(code, payload);
        if (response instanceof Error) {
          const errmsg = (response as Error).message;
          console.warn(seq, code, SysCodes.APP_ERROR, errmsg);
          postman.postError(seq, code, SysCodes.APP_ERROR, errmsg);
        } else {
          const transfer: Transferable[] | undefined = (response as IoProcessResult).transfer;
          // postman.postResponse(seq, code, response);
          if (!!transfer) {
            const {transfer, ...rest} = response as IoProcessResult;
            response = rest; // Remove transfer from the payload before posting
            postman.postResponse(seq, code, rest, transfer);
          } else {
            postman.postResponse(seq, code, response);
          }
          console.log(`[Worker] Rooundtrip (Seq: ${seq}, Code: ${code}): `, payload, response);
        }
      } else {
        const errmsg = `Unknown app code: ${code}`;
        console.error(errmsg);
        postman.postError(seq, code, SysCodes.UNKNOWN_CODE, errmsg);
      }
    } catch (reason: any) {
      console.error(reason);
      let errmsg: string = "na";
      if (reason instanceof Error) {
        errmsg = (reason as Error).message;
      }
      postman.postError(seq, code, SysCodes.APP_THROW, errmsg);
    }

    ++expectedSeq; // Increment for the next expected message
  }

  return { markHandlerReady, handlePostEvent };
})();

//-----------------------------------------------------------------------------
function _createPostman() {
  // Notify the main thread that the worker is ready. this reponse is special
  // as it is not a reply to an incoming message.
  function postImReady(): void {
    const response: RawWorkerResponse = {
      ack: -1n,
      ok: true,
      code: SysCodes.IAM_READY,
      error: "Worker is ready to accept messages",
    };
    globalThis.postMessage(response);
  }

  // Notify the main thread with a computed response.
  function postResponse(
    ack: bigint,
    reqcode: string,
    payload: Record<string, any>,
    transfer?: Transferable[],
  ): void {
    const response: RawWorkerResponse = {
      ack,
      ok: true,
      code: SysCodes.OK,
      reqcode,
      payload,
    };
    if (!transfer) {
      globalThis.postMessage(response);
    } else {
      globalThis.postMessage(response, {transfer});
    }
  }

  // Notify the main thread about an error.
  function postError(
    ack: bigint,
    reqcode: string,
    errcode: string,
    errmsg: string,
  ): void {
    const response: RawWorkerResponse = {
      ack,
      ok: false,
      code: errcode,
      reqcode,
      error: errmsg,
    };
    globalThis.postMessage(response);
  }

  return { postImReady, postResponse, postError };
}

//-----------------------------------------------------------------------------
globalThis.onmessage = handlePostEvent;
wasmService.awaitLoadComplete().then(markHandlerReady);
