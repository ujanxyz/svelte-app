<script lang="ts">
import { onMount } from "svelte";
import useMemlogging from "./useMemlogging";
import { kDummyLogs } from "../../utils/dummyData";
import { makeCircularPicker, makeRandomPicker } from "../../utils/random";
import { LogLevel } from "./types";

const { debugLog, infoLog, warnLog, errorLog } = useMemlogging();
const logMaker = (function() {
  type LogPicker = { pick: () => string};
  const debugLogPicker = makeCircularPicker(kDummyLogs.debug) as LogPicker;
  const infoLogPicker = makeCircularPicker(kDummyLogs.info) as LogPicker;
  const warnLogPicker = makeCircularPicker(kDummyLogs.warn) as LogPicker;
  const errorLogPicker = makeCircularPicker(kDummyLogs.error) as LogPicker;
  const pickerOfPicker = makeRandomPicker<[LogLevel, LogPicker]>([
    [LogLevel.DEBUG, debugLogPicker],
    [LogLevel.INFO, infoLogPicker],
    [LogLevel.WARNING, warnLogPicker],
    [LogLevel.ERROR, errorLogPicker],
   ], 0);
  
  function makeLog(): [LogLevel, string] {
    const [logLevel, textPicker] = pickerOfPicker.pick();
    return [logLevel, textPicker.pick()];
  }
  return {makeLog};
})();

let emitIntervalId = $state<number | null>(null);

function toggleLogging() {
  if (emitIntervalId === null) {
    emitIntervalId = window.setInterval(emitOneLog, 300);
  } else {
    window.clearInterval(emitIntervalId);
    emitIntervalId = null;
  }
}

function emitOneLog() {
  const [logLevel, text] = logMaker.makeLog();
  switch (logLevel) {
    case LogLevel.DEBUG:
      debugLog(text);
      break;
    case LogLevel.INFO:
      infoLog(text);
      break;
    case LogLevel.WARNING:
      warnLog(text);
      break;
    case LogLevel.ERROR:
      errorLog(text);
      break;
  }
}

onMount(() => {
  return () => {
    if (emitIntervalId !== null) {
      window.clearInterval(emitIntervalId);
    }
  };
});
</script>

<button onclick={toggleLogging} class="trigger" style="--toast-color: #2648AA">
  {(emitIntervalId === null) ? "Start" : "Pause"}
</button>

<style>
button {
  background-color: #aa2626;
}
.trigger {
  background-color: var(--toast-color);
  color: #f0f0f0;
  border-radius: 4px;
  padding: 6px 12px;
  font-weight: 400;
  cursor: pointer;
}
.trigger:not(:last-child) {
  margin-right: 16px;
  font-size: large;
}
</style>
