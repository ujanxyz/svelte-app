<script lang="ts">
import { onDestroy } from "svelte";

import TextButton from "@/components/TextButton.svelte";
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

async function openOverlayCards(ev: MouseEvent) {
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

<TextButton onclick={openOverlayCards} text="Open Recursive Cards" />

