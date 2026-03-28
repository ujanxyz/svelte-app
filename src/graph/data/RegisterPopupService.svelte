<script lang="ts">
import { Panel } from "@xyflow/svelte";

import FnGalleryV2 from "../../modules/fngallery/FnGalleryV2.svelte";
import { useOverlayUi } from "../../overlay/overlayStore";
import { type StatusOr } from "../../overlay/types";
import FlowDataInspector from "../datainspector/FlowDataInspector.svelte";
import { registerGraphService } from "../graph-services";

const galleryPopup = useOverlayUi(renderFnGallery);
//const dataInspectorPopup = useOverlayUi(renderDataInspector);

registerGraphService("popupService", {
  nodeFunctionGallery,
  flowDataInspector,
});

let showDataInspector = $state(false);

async function nodeFunctionGallery(): Promise<StatusOr<string>> {
  return await galleryPopup.openOverlayAsync<string>({});
}

async function flowDataInspector(): Promise<void> {
  // await dataInspectorPopup.openOverlayAsync<void>({}, {movable: true});
  showDataInspector = true;
  console.log("showDataInspector = true");
}
</script>

{#snippet renderFnGallery()}
  <FnGalleryV2 />
{/snippet}

<!-- {#snippet renderDataInspector()}
  <FlowDataInspector />
{/snippet} -->

{#if showDataInspector}
  <Panel position="bottom-left">Hello in pane</Panel>
{/if}
