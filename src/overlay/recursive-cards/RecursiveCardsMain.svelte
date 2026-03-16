<script lang="ts">
import { onDestroy } from "svelte";

import useMemlogging from "@/modules/memlogging/useMemlogging";

import { ReturnStatus } from "../constants";
import { useOverlayUi } from "../overlayStore";
import RecursiveCardWrapper from "./RecursiveCardWrapper.svelte";

const cardColors = [
  "#6F8FC7",
  "#809BCE",
  "#8FAFD0",
  "#A4CAD1",
  "#B8E0D2",
  "#C9E7D8",
  "#D6EADF",
  "#E1DCE0",
  "#EAC4D5",
  "#F2B6C8",
];

// let overlayCards: ReturnType<typeof useOverlayUi>;

const overlayCards = useOverlayUi(renderRecursiveCards);
const { debugLog, errorLog } = useMemlogging();

async function openOverlayCards() {
  const retVal = await overlayCards.openOverlayAsync<number>({}, {movable: true});
  if (ReturnStatus.OK === retVal.status) {
    debugLog(`Original card received OK. value: ${JSON.stringify(retVal.value)}`);
  } else {
    errorLog(`Original card received status: ${retVal.status}. Reason: ${JSON.stringify(retVal.reason)}`);
  }
  console.log(retVal);
}

onDestroy(() => {
  overlayCards.abortOverlay("UNMOUNTED");
});

</script>

{#snippet renderRecursiveCards()}
  <RecursiveCardWrapper {cardColors} />
{/snippet}

<button class="trigger" onclick={openOverlayCards}>Recursive Cards</button>

<style>
.trigger {
  background-color: #2656aa;
  color: #f0f0f0;
  border-radius: 4px;
  padding: 4px 8px;
  font-weight: 400;
  cursor: pointer;
}
</style>
