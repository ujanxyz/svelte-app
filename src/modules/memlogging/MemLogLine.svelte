<script lang="ts" module>
import BugIcon from "phosphor-svelte/lib/BugIcon";
import InfoIcon from "phosphor-svelte/lib/InfoIcon";
import WarningIcon from "phosphor-svelte/lib/WarningIcon";
import XCircleIcon from "phosphor-svelte/lib/XCircleIcon";

const kLevelToStr = {
  [LogLevel.DEBUG]: "D",
  [LogLevel.INFO]: "I",
  [LogLevel.WARNING]: "W",
  [LogLevel.ERROR]: "E",
};

function pad2(n: number) {
  return (n < 10 ? "0" : "") + n;
}

function formatAgoFast(now: number, ts: number): string {
  const millis = now - ts;
  if (millis < 100) {
    return "now";
  }
  const sTotal = (millis / 1000) | 0;
  const s = sTotal % 60;
  const m = ((sTotal / 60) | 0) % 60;
  // const h = (sTotal / 3600) | 0;
  // const t = ((millis % 1000) / 100) | 0;
  // return `${pad2(h)}:${pad2(m)}:${pad2(s)}.${t} ago`;
  return `${pad2(m)}:${pad2(s)} ago`;
}
</script>

<script lang="ts">
import { LogLevel } from "./types";

type Props = {
  level: LogLevel;
  timestamp: number;
  message: string;
  now: number;
};

const { level, timestamp, message, now }: Props = $props();
const strTimestamp = $derived(formatAgoFast(now, timestamp));

</script>

<div class="logentry" data-log-level={kLevelToStr[level]}>
  {#if level === LogLevel.DEBUG }
    <BugIcon size={18} />
  {:else if level === LogLevel.INFO }
    <InfoIcon size={18} />
  {:else if level === LogLevel.WARNING }
    <WarningIcon size={18} />
  {:else if level === LogLevel.ERROR }
    <XCircleIcon size={18} />
  {/if}
    
  [{strTimestamp}]: {message}
</div>

<style>
.logentry {
  width: 100%;
  padding: 2px;
  background-color: var(--color-bg-0);
  color: var(--color-text-md-con);
  font-size: 0.85rem;
  font-family: monospace;
  white-space: nowrap;
}

.logentry:nth-child(odd) {
  background-color: var(--color-bg-1);
}

.logentry[data-log-level="D"] {
  color: var(--color-text-md-con);
}
.logentry[data-log-level="I"] {
  color: #2dff5b;
}
.logentry[data-log-level="W"] {
  color: #29a9ee;
}
.logentry[data-log-level="E"] {
  color: #c81010;
}
</style>