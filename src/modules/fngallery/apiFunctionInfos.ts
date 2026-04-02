import { type fn } from "@/types/function";

import getFunctionSpecs from "./functionSpecs";

// Invalid during dev stage.
const FETCH_URL = "http://example.com/func-defs";

const USE_DUMMY_DATA = true;
const DUMMY_DATA_DELAY_MS = 250;

async function delayedDummyData<T>(
  dataFn: () => T,
  delay: number,
  signal: AbortSignal,
): Promise<T> {
  return new Promise((resolve, reject) => {
    // If the signal is already aborted, reject immediately.
    if (signal?.aborted) {
      return reject(signal.reason || new Error("Operation already aborted"));
    }
    const timeoutId = setTimeout(() => {
      resolve(dataFn());
      signal?.removeEventListener("abort", handleAbort);
    }, delay);

    const handleAbort = () => {
      clearTimeout(timeoutId);
      reject(signal.reason || new Error("Operation was aborted"));
    };
    // { once: true } ensures the listener is removed after the first abort
    signal?.addEventListener("abort", handleAbort, { once: true });
  });
}

export function fetchFnInfos() {
  let controller: AbortController | null = null;

  async function fetchItemsAsync(): Promise<fn.FunctionInfo[]> {
    if (controller) {
      controller.abort();
    }
    controller = new AbortController();
    if (USE_DUMMY_DATA) {
      return delayedDummyData<fn.FunctionInfo[]>(
        getFunctionSpecs,
        DUMMY_DATA_DELAY_MS,
        controller.signal,
      );
    } else {
      return fetch(FETCH_URL, { signal: controller.signal }).then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<fn.FunctionInfo[]>;
      });
    }
  }

  function abortFetch() {
    controller?.abort();
  }

  return { fetchItemsAsync, abortFetch };
}

export async function lookupFnDetailsAsync(
  funcUri: string,
): Promise<fn.FunctionInfo | undefined> {
  if (!USE_DUMMY_DATA) {
    throw new Error("Real api lookup not implemented");
  }
  const specs = getFunctionSpecs();
  return specs.find((fnInfo: fn.FunctionInfo) => fnInfo.uri === funcUri);
}
