<script lang="ts">
import type { Snippet } from "svelte";
import Layer from "./Layer.svelte";
import type { LayerData, DescendantUse } from "./types";

interface Props {
  layers: LayerData[];
}

const { layers }: Props = $props();
</script>

{#each layers as { layerId, payload, renderfn, descendantUse: clientuse }}
  <Layer
    layerId={layerId}
    layerPayload={payload}
    renderfn={renderfn}
    clientuse={clientuse}
  />
{/each}
