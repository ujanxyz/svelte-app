<script lang="ts">
import { onMount } from "svelte";
import store from "./store";
import { type MemLogEntry } from "./types";
import LogPaneActionBar from "./LogPaneActionBar.svelte";
import MemLogLine from "./MemLogLine.svelte";

let renderables = $state<MemLogEntry[]>([]);
let timeNow = $state<number>(Date.now());
let closedWidget = $state<boolean>(false);

onMount(() => {
  const unsubscribe = store.subscribeLogs(_onUpdateLogs);
  const intervalId = window.setInterval(() => {
    timeNow = Date.now();
  }, 2000);
  return () => {
    window.clearInterval(intervalId);
    unsubscribe();
  };
});

function _onUpdateLogs(logs: MemLogEntry[]) {
  renderables = logs;
}

function onClickClose() {
  closedWidget = true;
}
</script>

{#if !closedWidget && renderables.length > 0 }
  <div class="container">
    <LogPaneActionBar onclose={onClickClose} />
    <div class="logspanel">
      {#each renderables as renderable: MemLogEntry (renderable.id) }
        {@const { id, level, timestamp, message } = renderable }
        <MemLogLine {level} {timestamp} {message} now={timeNow} />
      {/each}
    </div>
  </div>
{/if}


<style>
.container {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);

  width: fit-content;
  width: 1100px;
  background-color: var(--color-bg-4);

  border-radius: 4px;
}
.logspanel {
  margin: 4px 4px;
  border-radius: 4px;
  max-height: 30rem;
  overflow-y: scroll;

  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
  justify-content: flex-start;
  align-content: flex-start;
  row-gap: 0px;
}
</style>