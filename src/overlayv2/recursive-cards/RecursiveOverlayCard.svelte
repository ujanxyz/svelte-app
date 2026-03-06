<script lang="ts">
import { onMount } from "svelte";
import RecursiveCardWrapper from "./RecursiveCardWrapper.svelte";
import { useOverlayUi } from "../overlayStore";
import CloseButton from "../CloseButton.svelte";
import useCurrentOverlay from "../useCurrentOverlay";

interface Props {
  cardIndex: number;
  selfColor: string;
  childColors: string[];
}

const { cardIndex, selfColor, childColors }: Props = $props();

const current = useCurrentOverlay();
const overlay = useOverlayUi(renderContent);

/* svelte-ignore state_referenced_locally */
current.setDebugName(`card-${cardIndex}`);

onMount(() => {
  // console.log("Mounted card ... ", cardIndex);
  if (childColors.length > 0) {
    const timeoutId = window.setTimeout(async () => {
      const retVal = await overlay.openOverlayAsync();
      console.log(retVal);
    }, 200);
    return () => window.clearTimeout(timeoutId);
  }
});
</script>

<div class="card" style="--color-card: {selfColor}; --card-index: {cardIndex};">
  Recursive Card {cardIndex}
  <CloseButton />
</div>

{#snippet renderContent()}
  <RecursiveCardWrapper
    cardColors={childColors}
    nextCardIndex={cardIndex + 1}
  />
{/snippet}

<style>
.card {
  background-color: var(--color-card);
  width: 60%;
  height: 40%;
  min-width: 300px;
  min-height: 200px;
  border-radius: 6px;
  padding: 8px 12px;
  color: #171717;
  transform: translate(
    calc(200px + var(--card-index) * -40px),
    calc(-300px + var(--card-index) * 60px)
  );
}
</style>
