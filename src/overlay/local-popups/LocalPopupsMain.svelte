<script lang="ts">
import { createRNG } from "../../utils/random";
import MasonryGrid from "./MasonryGrid.svelte";
import PropsEditorProvider from "./PropsEditorProvider.svelte";
import type { MasonryLayoutData } from "./types";
import { genMasonryColumns, gridToCellData } from "./utils";

const gridData: MasonryLayoutData = (function () {
  const rng = createRNG(543210);
  const numColumns = 3;
  const totalHeight = 100;
  const allowedHeights = [10, 15, 20, 25, 30];
  const masonry = genMasonryColumns(
    numColumns,
    totalHeight,
    allowedHeights,
    rng,
  );
  return gridToCellData(masonry, 123);
})();
</script>

<PropsEditorProvider>
  <div class="container">
    <MasonryGrid {gridData} />
  </div>
</PropsEditorProvider>

<style>
.container {
  aspect-ratio: 1;
  width: 90%;
  height: 95%;
}
</style>
