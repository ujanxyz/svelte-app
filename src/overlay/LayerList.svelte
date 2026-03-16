<script lang="ts">
import Layer from "./Layer.svelte";
import { type LayerData } from "./types";

interface Props {
  layers: LayerData[];
}

const { layers }: Props = $props();
</script>

{#each layers as { layerId, payload, opts: overlayOpts, renderfn, descendantUse: clientuse }}
  <Layer {layerId} layerPayload={payload} {overlayOpts} {renderfn} {clientuse} />
{/each}
