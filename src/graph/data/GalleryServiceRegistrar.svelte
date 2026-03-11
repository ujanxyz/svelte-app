<script lang="ts">
import { registerGraphService } from "../graph-services";
import { useOverlayUi } from "../../overlay/overlayStore";
import type { StatusOr } from "../../overlay/types";
import FnGalleryV2 from "../../modules/fngallery/FnGalleryV2.svelte";

const galleryPopup = useOverlayUi(renderFnGallery);

registerGraphService("galleryService", {
  pickFnFromGallery: pickFnFromGallery,
});

async function pickFnFromGallery(): Promise<StatusOr<string>> {
  return await galleryPopup.openOverlayAsync<string>({});
}
</script>

{#snippet renderFnGallery()}
  <FnGalleryV2 />
{/snippet}
