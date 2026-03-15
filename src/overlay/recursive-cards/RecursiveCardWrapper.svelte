<script lang="ts">
import { onMount } from "svelte";

import RecursiveOverlayCard from "./RecursiveOverlayCard.svelte";

interface Props {
  cardColors: string[];
  nextCardIndex?: number;
}

const { cardColors, nextCardIndex }: Props = $props();

onMount(() => {
  if (cardColors.length === 0) {
    throw new Error("Empty colors");
  }
});

/* svelte-ignore state_referenced_locally */
const [nextColor, ...childColors] = cardColors;
</script>

{#if !!nextColor}
  <RecursiveOverlayCard
    cardIndex={nextCardIndex ?? 1}
    selfColor={nextColor}
    {childColors}
  />
{/if}
