import {
  type SecureMessage,
  type WorkerResponse,
} from "@/types/worker-message-types";

import { CppGraphBuilder } from "./CppGraphBuilder.js";
import wasmService from "./wasmService.js";
import { WorkerIoManager } from "./WorkerIoManager.js";

const SysCodes = Object.freeze({
  OK: "_OK",
  IAM_READY: "_IAM_READY",
  NOT_READY: "_NOT_READY",
  SYNC_GAP: "_SYNC_GAP",
  UNKNOWN_CODE: "_UNKNOWN_CODE",
  APP_THROW: "_APP_THROW",
  APP_ERROR: "_APP_ERROR",
});

let graphBuilder: CppGraphBuilder | null = null;
let ioManager: WorkerIoManager | null = null;

//-----------------------------------------------------------------------------
const postman = (function createPostman() {
  // Notify the main thread that the worker is ready. this reponse is special
  // as it is not a reply to an incoming message.
  function postImReady(): void {
    const response: WorkerResponse = {
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
  ): void {
    const response: WorkerResponse = {
      ack,
      ok: true,
      code: SysCodes.OK,
      reqcode,
      payload,
    };
    globalThis.postMessage(response);
  }

  // Notify the main thread about an error.
  function postError(
    ack: bigint,
    reqcode: string,
    errcode: string,
    errmsg: string,
  ): void {
    const response: WorkerResponse = {
      ack,
      ok: false,
      code: errcode,
      reqcode,
      error: errmsg,
    };
    globalThis.postMessage(response);
  }

  return { postImReady, postResponse, postError };
})();

//-----------------------------------------------------------------------------
const { markHandlerReady, handlePostEvent } = (function createPostHandler() {
  let isThisWorkerReady = false;
  let expectedSeq: bigint = 0n;

  function markHandlerReady() {
    const graph = wasmService.newGraphEngineApi();
    graphBuilder = new CppGraphBuilder(graph, "GRAPH:");
    ioManager = new WorkerIoManager((globalThis as any).pipelineEvents as EventTarget);
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

    // Process and Respond
    // console.log(`[Worker] Received (Seq: ${seq}, Code: ${code}): `, payload);

    try {
      if (code.startsWith("GRAPH:")) {
        const response = await graphBuilder!.process(code, payload);
        if (response instanceof Error) {
          const errmsg = (response as Error).message;
          console.warn(seq, code, SysCodes.APP_ERROR, errmsg);
          postman.postError(seq, code, SysCodes.APP_ERROR, errmsg);
        } else {
          console.log(`[Worker] Rooundtrip (Seq: ${seq}, Code: ${code}): `, payload, response);
          postman.postResponse(seq, code, response!);
        }
      } else if (code.startsWith("IO:")) {
        const response = await ioManager!.process(code, payload);
        if (response instanceof Error) {
          const errmsg = (response as Error).message;
          console.warn(seq, code, SysCodes.APP_ERROR, errmsg);
          postman.postError(seq, code, SysCodes.APP_ERROR, errmsg);
        } else {
          console.log(`[Worker] Rooundtrip (Seq: ${seq}, Code: ${code}): `, payload, response);
          postman.postResponse(seq, code, response);
        }
      } else {
        const errmsg = `Unknown app code: ${code}`;
        console.error(errmsg);
        postman.postError(seq, code, SysCodes.UNKNOWN_CODE, errmsg);
      }
    } catch (reason: any) {
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
globalThis.onmessage = handlePostEvent;
wasmService.awaitLoadComplete().then(markHandlerReady);
