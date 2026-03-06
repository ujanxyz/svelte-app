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
  const pr = await overlayCards.openOverlayAsync<number>();
  console.log(pr);
}
</script>

{#snippet renderRecursiveCards()}
  Rec cards !!
  <RecursiveCardWrapper cardColors={cardColors} />
  <br />
{/snippet}

<button onclick={openOverlayCards}>Recursive Cards</button>
