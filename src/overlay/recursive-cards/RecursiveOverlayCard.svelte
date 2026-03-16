<script lang="ts">
import { onMount } from "svelte";

import useMemlogging from "@/modules/memlogging/useMemlogging";

import { ReturnStatus } from "../constants";
import { useOverlayUi } from "../overlayStore";
import useCurrentOverlay from "../useCurrentOverlay";
import RecursiveCardWrapper from "./RecursiveCardWrapper.svelte";
import TopNavBar from "./TopNavBar.svelte";

interface Props {
  cardIndex: number;
  selfColor: string;
  childColors: string[];
}

const { cardIndex, selfColor, childColors }: Props = $props();

const current = useCurrentOverlay();
const overlay = useOverlayUi(renderContent);
const { debugLog, errorLog } = useMemlogging();

onMount(() => {
  // Launch another child card after N msecs, unless it is the last card.
  if (childColors.length > 0) {
    const timeoutId = window.setTimeout(async () => {
      const retVal = await overlay.openOverlayAsync({}, {movable: true});
      if (ReturnStatus.OK === retVal.status) {
        debugLog(`Card# ${cardIndex} received OK. value: ${JSON.stringify(retVal.value)}`);
      } else {
        errorLog(`Card# ${cardIndex} received status: ${retVal.status}. Reason: ${JSON.stringify(retVal.reason)}`);
      }
      console.log(retVal);
    }, 30);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }
});
</script>

<div
  class="card flex-sections"
  style="--color-card: {selfColor}; --card-index: {cardIndex};"
>
  <TopNavBar title={"Card# " + cardIndex} />
  <section class="content">
    Content {cardIndex}
  </section>
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
  width: 40%;
  height: 30%;
  min-width: 200px;
  min-height: 150px;
  border-radius: 6px;
  overflow: hidden;
  color: #171717;
  box-shadow: 4px 4px 6px 2px rgba(0, 0, 0, 0.2);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(
    calc(-50% + 200px + var(--card-index) * -40px),
    calc(-50% + -300px + var(--card-index) * 60px)
  );
}
.flex-sections {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.content {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 4rem;
  font-weight: 200;
}
</style>
