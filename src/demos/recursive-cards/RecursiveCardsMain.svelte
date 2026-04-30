<script lang="ts">
import { onDestroy } from "svelte";

import useMemlogging from "@/modules/memlogging/useMemlogging";
import * as overlay2 from "@/modules/overlay2";

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

const overlayMgr = overlay2.useOverlayManager();
const recCards = overlay2.createOverlayController<{}, number>(overlayMgr, renderRecursiveCards);

const { debugLog, errorLog } = useMemlogging();

async function openOverlayCards() {
  const retValue: overlay2.OverlayResult<any> = await recCards.open({}, { dismissOnBackdrop: false });
  if (retValue.status === overlay2.overlayStatuses.OK) {
    debugLog(
      `Original card received OK. value: ${JSON.stringify(retValue.value)}`,
    );
  } else {
    errorLog(
      `Original card received status: ${retValue.status}. Reason: ${JSON.stringify(retValue.reason)}`,
    );
  }
  console.log(retValue);
}

onDestroy(() => {
  recCards.abort(overlay2.overlayStatuses.UNMOUNTED);
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
