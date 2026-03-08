<script lang="ts">
import { onMount, type Snippet } from "svelte";
import overlayStore from "./overlayStore";
import LayerList from "./LayerList.svelte";
import type { LayerData, OverlayEntry } from "./types";
import clickoutside from "./clickoutside";

interface Props {
  children: Snippet;
}

const { children }: Props = $props();

let rootDiv: HTMLDivElement;

function onStackChange(entries: OverlayEntry[]) {
  layers = entries.map((layer: OverlayEntry): LayerData => {
    const { layerId, payload, renderfn, descendantUse } = layer;
    return { layerId, payload, renderfn, descendantUse } as LayerData;
  });
}

let layers = $state<LayerData[]>([]);

onMount(() => {
  const unsubscribe = overlayStore.subscribeStackChange(onStackChange);
  return () => {
    unsubscribe();
    overlayStore.clearOverlays();
  };
});

function _clearOverlays(ev: CustomEvent) {
  const layerDivs = rootDiv.querySelectorAll<HTMLDivElement>("[data-layer-id]");
  const { clientX, clientY } = ev.detail;
  const point = { clientX, clientY };
  let foundIndex = -1;
  for (let i = layerDivs.length - 1; i >= 0; --i) {
    if (pointInAnyChild(layerDivs[i], point)) {
      foundIndex = i;
      break;
    }
  }
  if (foundIndex < 0) {
    // Clicked outside, remove all layers.
    overlayStore.clearOverlays();
  } else {
    // Clicked on the found layer, remove all above it.
    const startIndex = foundIndex + 1;
    if (startIndex >= layerDivs.length) return;
    const layerId = layerDivs[startIndex].dataset.layerId;
    if (!!layerId) {
      overlayStore.clearLayersFrom(layerId);
    }
    console.log("Found hit: ", layerId);
  }
}

function pointInAnyChild(
  parent: HTMLDivElement,
  point: { clientX: number; clientY: number },
): boolean {
  const children = parent.children;
  const nchildren = children.length;
  if (nchildren === 0) return false;

  const x = point.clientX;
  const y = point.clientY;

  for (let i = 0; i < nchildren; i++) {
    const r = children[i].getBoundingClientRect();
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
      return true;
    }
  }
  return false;
}

function handleWinResize() {
  overlayStore.clearOverlays();
}
</script>

<div
  data-name="OverlayProvider"
  class="provider"
  use:clickoutside
  onclickoutside={_clearOverlays}
>
  {@render children()}
  <div class="contents" bind:this={rootDiv}>
    <LayerList layers={layers} />
  </div>
</div>

<!-- Clear all popups on window resize, as they would look displaced -->
<svelte:window on:resize={handleWinResize} />

<style>
.provider {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}
.contents {
  display: contents;
}
</style>
