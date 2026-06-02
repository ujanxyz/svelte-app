import { SysCodes } from "../constants";
import type { bgtask } from "./types";

class Postman {
  private readonly workerScope: bgtask.host.WrokerScope;

  constructor(workerScope: bgtask.host.WrokerScope) {
    this.workerScope = workerScope;
  }

  // Notify the main thread that the worker is ready. this reponse is special
  // as it is not a reply to an incoming message.
  public postImReady(): void {
    const response: bgtask.host.RawWorkerResponse = {
      ack: -1n,
      ok: true,
      code: SysCodes.IAM_READY,
      error: "Worker is ready to accept messages",
    };
    this.workerScope.postMessage(response);
  }
  
  // Notify the main thread with a computed response.
  public postResponse(
    ack: bigint,
    reqcode: string,
    payload: Record<string, any>,
    transfer?: Transferable[],
  ): void {
    const response: bgtask.host.RawWorkerResponse = {
      ack,
      ok: true,
      code: SysCodes.OK,
      reqcode,
      payload,
    };
    if (!transfer) {
      this.workerScope.postMessage(response);
    } else {
      this.workerScope.postMessage(response, {transfer});
    }
  }
  
  // Notify the main thread about an error.
  public postError(
    ack: bigint,
    reqcode: string,
    errcode: string,
    errmsg: string,
  ): void {
    const response: bgtask.host.RawWorkerResponse = {
      ack,
      ok: false,
      code: errcode,
      reqcode,
      error: errmsg,
    };
    this.workerScope.postMessage(response);
  }  
}

export { Postman };
