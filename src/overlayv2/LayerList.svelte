<script lang="ts">
import type { Snippet } from "svelte";
import Layer from "./Layer.svelte";
import type { LayerData, DescendantUse } from "./types";

interface Props {
  layers: LayerData[];
}

const { layers }: Props = $props();
</script>

{#each layers as { renderfn, descendantUse: clientuse }}
  <Layer renderfn={renderfn} clientuse={clientuse} />
{/each}
