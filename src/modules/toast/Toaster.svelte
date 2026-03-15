<script lang="ts">
import { onMount } from "svelte";

import store from "./store";
import ToastRenderable from "./ToastRenderable.svelte";
import { type ToastEntry, ToastType } from "./types";

const { subscribeNow } = store;
let renderables = $state<ToastEntry[]>([]);
let intervalId: number | undefined = undefined;

const themeColors = {
  [ToastType.INFO]: "#2b7cff",
  [ToastType.SUCCESS]: "#26AA48",
  [ToastType.WARNNG]: "#AAA826",
  [ToastType.ERROR]: "#AA4848",
};

onMount(() => {
  const unsubscribe = store.subscribeToasts(_onUpdateToasts);
  return () => {
    unsubscribe();
  };
});

function _onUpdateToasts(toasts: ToastEntry[]) {
  renderables = toasts;
  _setEnabledTicks(renderables.length > 0);
}

function _setEnabledTicks(enable: boolean) {
  if (!!intervalId) window.clearInterval(intervalId);
  intervalId = enable ? window.setInterval(_onTick, 100) : undefined;
}

function _onTick() {
  store.updateNow();
}

function onExpireToast(id: string) {
  store.rmToast(id);
}
</script>

{#if renderables.length > 0}
  <div class="toaster">
    {#each renderables as renderable}
      {@const { id, type, message, startedAt } = renderable}
      {@const themeColor = themeColors[type]}
      <ToastRenderable
        {id}
        {startedAt}
        {message}
        {themeColor}
        {subscribeNow}
        onexpire={onExpireToast}
      />
    {/each}
  </div>
{/if}

<style>
.toaster {
  position: absolute;
  bottom: 15px;
  right: 15px;
  width: 24rem;

  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
  justify-content: flex-start;
  align-content: flex-start;
  row-gap: 4px;
  padding: 4px;
}
</style>
