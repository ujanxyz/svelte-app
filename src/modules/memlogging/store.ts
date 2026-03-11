import { get, writable } from "svelte/store";
import type { LogLevel, MemLogEntry } from "./types";

const MAX_LOGS_COUNT = 25;

const store = (function () {
  const entries = writable<MemLogEntry[]>([]);
  let nextId = 0n;

  function appendLog(level: LogLevel, message: string) {
    const id = ++nextId;
    const timestamp = Date.now();
    const entry: MemLogEntry = { id, level, timestamp, message };
    entries.update((n) => [entry, ...n].slice(0, MAX_LOGS_COUNT));
  }

  return {
    appendLog,
    subscribeLogs: entries.subscribe,
  };
})();

export default store;
