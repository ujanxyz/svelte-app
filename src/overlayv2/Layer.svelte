<script lang="ts">
import { setContext } from "svelte";
import type { LayerSnippetFn, DescendantUse, LayerUse } from "./types";
import { LAYER_CONTEXT_KEY } from "./constants";

interface Props {
  renderfn: LayerSnippetFn;
  clientuse: DescendantUse;
}

const { renderfn, clientuse }: Props = $props();
let layerName = $state("not-set");

/* svelte-ignore state_referenced_locally */
const layerUse: LayerUse = {
  ...clientuse,
  setDebugName,
};

setContext(LAYER_CONTEXT_KEY, layerUse);

function _hideOverlay(ev: CustomEvent) {
  const { node } = ev.detail;
  console.log("In _hideOverlay ...", node);
  clientuse.abortOverlay();
}

function setDebugName(name: string): void {
  console.log("In setDebugName ...", name);
  layerName = name;
}

function onClickLayer(event: PointerEvent): void {
  layerUse.abortOverlay();
}

</script>

<div onclick={onClickLayer}
  data-layer-name={"layer:" + layerName} class="layer">
  <div class="content" data-layer-name={"content:" + layerName} >
    {@render renderfn()}
  </div>
</div>

<style>
.layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* background: rgba(128, 128, 128, 0.3);
  backdrop-filter: blur(4px); */
}
.content {
  position: fixed;
  margin: auto;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
