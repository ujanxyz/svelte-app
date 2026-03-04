<script lang="ts">
  import type { Snippet } from "svelte";
  import type { OverlayChildUse } from "./types";

  interface Props {
    overlayUse: OverlayChildUse;
    children: Snippet;
  }

  const { overlayUse, children } : Props = $props();
</script>

<div class="container" data-debug-name="overlay-gallery" aria-label="TODO: (Gallery Title Here)">
  <!-- <button onclick={(eve) => {overlayUse.close()}}>Close overlay</button>
  <hr/> -->
  {@render children()}
</div>

<style>
.container {
  animation: dropdown-in 200ms ease;
}

@keyframes dropdown-in {
from {
    opacity: 0;
    transform: translateY(-50%);
}
to {
    opacity: 1;
    transform: translateY(0);
}
}
</style>