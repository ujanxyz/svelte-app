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

function onStackChange(entries: OverlayEntry[]) {
  layers = entries.map((layer: OverlayEntry): LayerData => {
    const { renderfn, descendantUse } = layer;
    return { renderfn, descendantUse };
  });
}

let layers = $state<LayerData[]>([]);

onMount(() => {
  return overlayStore.subscribeStackChange(onStackChange);
});

function _clearOverlays(ev: CustomEvent) {
  const { node } = ev.detail;
  console.log("In _clearOverlays ...", node);
}

</script>

<div data-name="OverlayProvider" class="provider" use:clickoutside
  onclickoutside={_clearOverlays}>
  {@render children()}
  <LayerList layers={layers} />
</div>

<style>
.provider {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}
</style>
