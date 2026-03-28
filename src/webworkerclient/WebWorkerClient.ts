import {
  type SecureMessage,
  type WorkerResponse,
} from "@/types/worker-message-types";

// main.ts

interface ResponseData {
  code: string;
  payload: Record<string, any>;
}

interface MapEntry {
  resolve: (data: ResponseData) => void;
  reject: (reason: any) => void;
  timer: number;
}

class WebWorkerClient {
  private readonly worker: Worker;
  private readonly readyPromise: Promise<void>;
  private currentSeq: bigint = 0n;
  private pendingRequests = new Map<bigint, MapEntry>();

  public constructor(worker: Worker) {
    this.worker = worker;

    // Create a promise that resolves when the worker says "IM_READY"
    this.readyPromise = new Promise((resolve) => {
      const initHandler = (event: MessageEvent<WorkerResponse>) => {
        if (event.data.code === "_IAM_READY") {
          this.worker.removeEventListener("message", initHandler);
          resolve();
        }
      };
      this.worker.addEventListener("message", initHandler, { once: true });
    });

    this.setupErrorHandlers();
    this.setupListener();
  }

  private setupListener(): void {
    this.worker.addEventListener(
      "message",
      (event: MessageEvent<WorkerResponse>) => {
        const {
          ack,
          ok: responseOk,
          code,
          reqcode,
          payload,
          error,
        } = event.data as WorkerResponse;
        if (
          ack === undefined ||
          responseOk === undefined ||
          code === undefined
        ) {
          console.error(event.data);
          throw new Error("Worker message missing required fields");
        }
        if (ack < 0n) {
          // Skip messages like IAM_READY
          return;
        }

        const pending = this.pendingRequests.get(ack);
        if (pending) {
          clearTimeout(pending.timer); // Stop the timeout clock
          if (responseOk !== true) {
            // Reject is not used in non-fatal client errors.
            pending.resolve({ code: "_CLIENT_ERR", payload: {} });
          } else {
            pending.resolve({ code, payload: payload! });
          }
          this.pendingRequests.delete(ack);
        } else {
          console.warn(`Received unexpected ack: ${ack}`);
        }
      },
    );
  }

  private setupErrorHandlers() {
    // Script/Logic Errors
    this.worker.onerror = (event: ErrorEvent) => {
      console.log(event);
      console.error(
        `[Main] Worker Script Error: ${event.message} at ${event.lineno}`,
      );

      // Critical failure: Reject all pending requests
      for (const [seq, pending] of this.pendingRequests) {
        clearTimeout(pending.timer);
        pending.reject(new Error(`Worker Crashed: ${event.message}`));
      }
      this.pendingRequests.clear();
    };

    // Deserialization Errors
    this.worker.onmessageerror = (event: MessageEvent) => {
      console.error("[Main] Message Deserialization Error!", event);
      // Note: Usually, we don't get an 'ack' here because the message
      // couldn't be read. This often requires a heartbeat/timeout to recover.
    };
  }

  public async send(
    code: string,
    payload: Record<string, any>,
    timeoutMs: number = 5000,
  ): Promise<ResponseData> {
    // 1. Ensure worker is initialized
    await this.readyPromise;

    // Valid sequence ids start at 0. -ve is reserved for IAM_READY message.
    const seq = this.currentSeq++;

    return new Promise<ResponseData>((resolve, reject) => {
      // 2. Setup the timeout
      const timer = window.setTimeout(() => {
        if (this.pendingRequests.has(seq)) {
          this.pendingRequests.delete(seq);
          reject(new Error(`Request ${seq} timed out after ${timeoutMs}ms`));
        }
      }, timeoutMs);

      this.pendingRequests.set(seq, { resolve, reject, timer });
      const secureMsg: SecureMessage = { seq, code, payload };
      this.worker.postMessage(secureMsg);
    });
  }
}

export { WebWorkerClient };
