<script lang="ts">
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

const overlayCards = useOverlayUi(renderRecursiveCards);

async function openOverlayCards() {
  const retValue = await overlayCards.openOverlayAsync<number>({});
  console.log(retValue);
}
</script>

{#snippet renderRecursiveCards()}
  <RecursiveCardWrapper cardColors={cardColors} />
{/snippet}

<button class="trigger" onclick={openOverlayCards}>Recursive Cards</button>

<style>
.trigger {
  background-color: #2656aa;
  color: #F0F0F0;
  border-radius: 4px;
  padding: 4px 8px;
  font-weight: 400;
  cursor: pointer;
}
</style>