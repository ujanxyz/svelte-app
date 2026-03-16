<script lang="ts">
import FnGalleryV2 from "../../modules/fngallery/FnGalleryV2.svelte";
import { useOverlayUi } from "../../overlay/overlayStore";
import { type StatusOr } from "../../overlay/types";
import { registerGraphService } from "../graph-services";

const galleryPopup = useOverlayUi(renderFnGallery);

registerGraphService("popupService", {
  nodeFunctionGallery,
});

async function nodeFunctionGallery(): Promise<StatusOr<string>> {
  return await galleryPopup.openOverlayAsync<string>({});
}
</script>

{#snippet renderFnGallery()}
  <FnGalleryV2 />
{/snippet}
