import MyWorker from '../workerserver?worker';

const WORKER_URL = new URL("./worker/myWorker.ts", import.meta.url);

function useWebWorker() {
  //let rawWorker: Worker | null = null;

  
  const rawWorker = new MyWorker({name: "GraphWorker"});

  rawWorker.onmessage = _onWorkerMessage;
  rawWorker.onerror = _onWorkerError;

  function _onWorkerMessage(event: MessageEvent) {
    const result = event.data;
    console.log("Received from worker: ", result);
  }

  function _onWorkerError(event: ErrorEvent) {
    console.log("Received error in: ", event);
  }

  function sendMessage() {
    rawWorker.postMessage({ a: 2, b: 3 });
  }

  return { sendMessage };
}

export { useWebWorker };