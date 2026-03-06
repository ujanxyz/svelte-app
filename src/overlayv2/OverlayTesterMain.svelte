<script lang="ts">
import { useOverlayUi } from "./overlayStore";
import LayerList from "./LayerList.svelte";
import CloseButton from "./CloseButton.svelte";
import RecursiveCardsMain from "./recursive-cards/RecursiveCardsMain.svelte";

const overlay1 = useOverlayUi(renderui);
const overlay2 = useOverlayUi(renderB);
const overlay3 = useOverlayUi(renderC);

async function openOverlay1() {
  const pr = await overlay1.openOverlayAsync<number>();
  console.log(pr);
}
</script>

0

{#snippet renderui()}
  Render A
  <CloseButton />
  <br />
{/snippet}

{#snippet renderB()}
  Render B
  <CloseButton />
  <br />
{/snippet}

{#snippet renderC()}
  Render C
  <CloseButton />
  <br />
{/snippet}

<div>
  Hello overlay
  <br />

  <button onclick={openOverlay1}>Add A</button>
  &nbsp; &nbsp; &nbsp;
  <button onclick={() => overlay1.openOverlayAsync()}>Add A</button>
  &nbsp;
  <button onclick={() => overlay2.openOverlayAsync()}>Add B</button>
  &nbsp;
  <button onclick={() => overlay3.openOverlayAsync()}>Add C</button>

  <br />

  <button onclick={() => overlay1.settleOverlay(1)}>Close A</button>
  &nbsp;
  <button onclick={() => overlay2.settleOverlay("two")}>Close B</button>
  &nbsp;
  <button onclick={() => overlay3.settleOverlay({ name: "three" })}
    >Close C</button
  >

  <hr />
  <RecursiveCardsMain />
</div>
