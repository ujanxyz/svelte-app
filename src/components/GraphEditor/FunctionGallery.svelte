<script lang="ts">
  import FnGalleryMain from "../../fngallery/FnGalleryMain.svelte";
  import type { OverlayChildUse } from "../overlay/types";

  interface Props {
    overlayUse: OverlayChildUse;
  }

  const { overlayUse } : Props = $props();

</script>

<div class="container" data-debug-name="gallery-popup">
  <FnGalleryMain onClose={() => overlayUse.close()} />
</div>

<style>
.container {
  display: contents;
}
</style>