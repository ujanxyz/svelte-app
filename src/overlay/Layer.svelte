<script lang="ts">
import { setContext } from "svelte";

import { LAYER_CONTEXT_KEY } from "./constants";
import type {
  DescendantUse,
  LayerPayload,
  LayerSnippetFn,
  LayerUse,
  OverlayOpts,
} from "./types";

interface Props {
  layerId: string;
  layerPayload: LayerPayload;
  overlayOpts: OverlayOpts;
  renderfn: LayerSnippetFn;
  clientuse: DescendantUse;
}

const { layerId, layerPayload, overlayOpts, renderfn, clientuse }: Props =
  $props();
const translate: { dx: number; dy: number } = { dx: 0, dy: 0 };
let layerDiv: HTMLDivElement;
let movableDiv: HTMLDivElement;

/* svelte-ignore state_referenced_locally */
const layerUse: LayerUse = {
  ...clientuse,
  getLayerPayload,
  getLayerDiv,
  getTranslate,
  setTranslate,
};

setContext(LAYER_CONTEXT_KEY, layerUse);

function getLayerPayload(): LayerPayload {
  return $state.snapshot(layerPayload);
}

function getLayerDiv(): HTMLDivElement {
  return layerDiv!;
}

function getTranslate(): { dx: number; dy: number } {
  return { dx: translate.dx, dy: translate.dy };
}

function setTranslate(dx: number, dy: number) {
  if (!overlayOpts.movable) {
    throw new Error("Layer not movable");
  }
  translate.dx = dx;
  translate.dy = dy;
  movableDiv.style.transform = `translate(${dx}px, ${dy}px)`;
}
</script>

{#if overlayOpts.movable}
  <div
    class="layer"
    bind:this={layerDiv}
    data-layer-id={layerId}
    data-kind="layer-movable"
    style:pointer-events="none"
  >
    <div class="movable" bind:this={movableDiv} data-kind="layer-content">
      {@render renderfn()}
    </div>
  </div>
{:else}
  <div
    class="layer"
    bind:this={layerDiv}
    data-layer-id={layerId}
    data-kind="layer"
  >
    {@render renderfn()}
  </div>
{/if}

<style>
.layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  /* backdrop-filter: blur(4px); */
}
:global(.movable) {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
:global(.movable > *) {
  pointer-events: auto;
}
</style>
