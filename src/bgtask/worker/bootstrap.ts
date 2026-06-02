import type { SecureMessage } from "@/types/worker-message-types";

import { SysCodes } from "../constants";
import { Postman } from "./Postman";
import type { bgtask } from "./types";

type OnInitFnAsyncType = () => Promise<bgtask.host.BgTaskPlugin[]>;
type PluginMap = {
  [prefix: string]: bgtask.host.BgTaskPlugin;
}

async function bootstrapAsWebWorker(scope: bgtask.host.WrokerScope, initAsync: OnInitFnAsyncType): Promise<void> {
  const postman = new Postman(scope);

  const pluginArray: bgtask.host.BgTaskPlugin[] = [];
  try {
    const plugins = await initAsync();
    pluginArray.push(...plugins);
  } catch (err) {
    console.error("Error during worker async initialization:", err);
    // Still post ready to avoid hanging the main thread, but include error info.
    postman.postError(0n, SysCodes.INIT_ERR, "WORKER_INIT_ERROR", String(err));
    return;
  }

  const pluginMap = {} as PluginMap;
  for (const plugin of pluginArray) {
    if (pluginMap[plugin.prefix]) {
      console.warn(`Duplicate plugin prefix detected: ${plugin.prefix}. This may cause unexpected behavior.`);
    }
    pluginMap[plugin.prefix] = plugin;
  }

  const { markHandlerReady, handlePostEvent } = createPostHandler(postman, pluginMap);
  scope.onmessage = handlePostEvent;
  markHandlerReady();
  postman.postImReady();
}

function createPostHandler(postman: Postman, pluginMap: PluginMap) {
  let isThisWorkerReady = false;
  let expectedSeq: bigint = 0n;

  function markHandlerReady() {
    isThisWorkerReady = true;
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
        "Worker not ready.",
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

    // Extract the prefix from the code. The code as the form "<prefix>:<plugin-specific-code>"
    const prefixEndIdx = code.indexOf(":");
    if (prefixEndIdx < 0) {
      const errmsg = `Bad code format: ${code}`;
      console.error(errmsg);
      postman.postError(seq, code, SysCodes.BAD_CODE_FMT, errmsg);
      return;
    }
    const prefix = code.substring(0, prefixEndIdx);
    const plugin = pluginMap[prefix];
    if (!plugin) {
      const errmsg = `Unknown plugin prefix: ${prefix}`;
      console.error(errmsg);
      console.log(pluginMap);
      postman.postError(seq, code, SysCodes.NO_PLUGIN, errmsg);
      return;
    }

    try {
      let response: bgtask.host.PluginProcessResult = await plugin.onProcess(code, payload);
      console.log(`[Worker] Rooundtrip ${plugin.prefix} (Seq: ${seq}, Code: ${code}): `, payload, response);
      if (response.transfer) {
        const {transfer, ...rest} = response;
        response = rest; // Remove transfer from the payload before posting
        postman.postResponse(seq, code, rest, transfer);
      } else {
        postman.postResponse(seq, code, response!);
      }
    } catch (reason: any) {
      let errmsg: string = "na";
      if (reason instanceof Error) {
        errmsg = (reason as Error).message;
      }
      console.warn(seq, code, SysCodes.APP_ERROR, errmsg);
      postman.postError(seq, code, SysCodes.APP_ERROR, errmsg);
    }

    ++expectedSeq; // Increment for the next expected message
  }

  return { markHandlerReady, handlePostEvent };
}

export { bootstrapAsWebWorker };