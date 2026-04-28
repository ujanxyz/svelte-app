<script lang="ts">
import { onMount, setContext, type Snippet } from "svelte";

import { OVERLAY_MANAGER_CONTEXT } from "./constants";
import OverlayLayer from "./OverlayLayer.svelte";
import type { OverlayEntry, OverlayManager } from "./types";

interface Props {
  children?: Snippet;
  manager: OverlayManager;
  baseZIndex?: number;
}

const {
  children,
  manager,
  baseZIndex = 1000,
}: Props = $props();

/* svelte-ignore state_referenced_locally */
setContext(OVERLAY_MANAGER_CONTEXT, manager);

let entries = $state.raw<OverlayEntry[]>([]);

onMount(() => {
  const unsubscribe = manager.subscribe((nextEntries) => {
    entries = nextEntries;
  });

  return unsubscribe;
});

function handleKeydown(event: KeyboardEvent): void {
  if (event.key !== "Escape") {
    return;
  }

  const top = entries.at(-1);
  if (!top || !top.options.dismissOnEscape) {
    return;
  }

  manager.abort(top.id);
}

function handleWindowResize(): void {
  if (entries.some((entry) => entry.options.closeOnWindowResize)) {
    manager.abortAll();
  }
}
</script>

<div class="overlay-root" data-debug-name="OverlayRoot">
  {#if children}
    {@render children()}
  {/if}

  <div class="overlay-stack" data-debug-name="OverlayRoot.stack">
    {#each entries as entry, index (entry.id)}
      <OverlayLayer
        {entry}
        {manager}
        {index}
        {baseZIndex}
        isTopmost={index === entries.length - 1}
      />
    {/each}
  </div>
</div>

<svelte:window onkeydown={handleKeydown} onresize={handleWindowResize} />

<style>
.overlay-root {
  width: 100%;
  height: 100%;
}

.overlay-stack {
  position: fixed;
  inset: 0;
  pointer-events: none;
}
</style>