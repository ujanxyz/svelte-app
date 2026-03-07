<script lang="ts">
import { setContext } from "svelte";
import type {
  LayerSnippetFn,
  DescendantUse,
  LayerUse,
  LayerPayload,
} from "./types";
import { LAYER_CONTEXT_KEY } from "./constants";

interface Props {
  layerId: string;
  layerPayload: LayerPayload;
  renderfn: LayerSnippetFn;
  clientuse: DescendantUse;
}

const { layerId, layerPayload, renderfn, clientuse }: Props = $props();
let layerName = $state("not-set");

/* svelte-ignore state_referenced_locally */
const layerUse: LayerUse = {
  ...clientuse,
  getLayerPayload,
  setDebugName,
};

setContext(LAYER_CONTEXT_KEY, layerUse);

function getLayerPayload(): LayerPayload {
  return layerPayload;
}

function setDebugName(name: string): void {
  layerName = name;
}
</script>

<div class="layer" data-layer-id={layerId}>
  {@render renderfn()}
</div>

<style>
.layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* background: rgba(128, 128, 128, 0.3);
  transform: translate(-50%, -50%);
  backdrop-filter: blur(4px); */
}
</style>
