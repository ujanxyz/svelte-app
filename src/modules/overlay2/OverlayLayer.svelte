<script lang="ts">
import { setContext } from "svelte";

import { OVERLAY_INSTANCE_CONTEXT } from "./constants";
import type {
  OverlayAbortStatus,
  OverlayEntry,
  OverlayInstance,
  OverlayManager,
} from "./types";

interface Props {
  entry: OverlayEntry;
  manager: OverlayManager;
  index: number;
  baseZIndex: number;
  isTopmost: boolean;
}

const { entry, manager, index, baseZIndex, isTopmost }: Props = $props();

/* svelte-ignore state_referenced_locally */
const overlayInstance: OverlayInstance = {
  id: entry.id,
  payload: entry.payload,
  options: entry.options,
  manager,
  settle: (value) => {
    manager.settle(entry.id, value);
  },
  abort: (status?: OverlayAbortStatus) => {
    manager.abort(entry.id, status);
  },
};

setContext(OVERLAY_INSTANCE_CONTEXT, overlayInstance);

function handleBackdropDismiss(): void {
  manager.abort(entry.id);
}
</script>

<div
  class="overlay-layer"
  data-debug-name="OverlayLayer.root"
  style:z-index={baseZIndex + index}
>
  {#if isTopmost && entry.options.dismissOnBackdrop}
    <button
      type="button"
      class="overlay-backdrop"
      aria-label="Dismiss overlay"
      onclick={handleBackdropDismiss}
    ></button>
  {/if}

  <div class="overlay-content" data-debug-name="OverlayLayer.content">
    {@render entry.render()}
  </div>
</div>

<style>
.overlay-layer {
  position: fixed;
  inset: 0;
  pointer-events: auto;
}

.overlay-backdrop {
  position: absolute;
  inset: 0;
  background: transparent;
  border: 0;
  padding: 0;
  margin: 0;
  cursor: default;
  pointer-events: auto;
  z-index: 0;
}

.overlay-content {
  /* Do not create a full-screen hitbox above the backdrop. */
  display: contents;
}

:global(.overlay-content > *) {
  /* position: fixed is crucial to capture clicks within the overlay content */
  position: fixed !important;
  pointer-events: auto;
  z-index: 1;
}
</style>