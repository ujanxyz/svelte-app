<script lang="ts">
import { Panel } from "@xyflow/svelte";

import ManualInputEditor from "@/modules/sloteditor/ManualInputEditor.svelte";
import type { fn } from "@/types/function";
import type { plinfo } from "@/types/plinfo";
import type { plstate } from "@/types/plstate";

import FnGalleryV2 from "../../modules/fngallery/FnGalleryV2.svelte";
import { useOverlayUi } from "../../overlay/overlayStore";
import { type StatusOr } from "../../overlay/types";
import { registerGraphService } from "../graph-services";

type Ntype = plinfo.NodeInfo["ntype"];

const galleryPopup = useOverlayUi(renderFnGallery);
//const dataInspectorPopup = useOverlayUi(renderDataInspector);
const graphInputPopup = useOverlayUi(renderGraphInputEditor);

registerGraphService("popupService", {
  nodeTemplateGallery,
  flowDataInspector,
  graphInputEditor,
});

let showDataInspector = $state(false);

async function nodeTemplateGallery(ntype: Ntype): Promise<StatusOr<fn.FunctionInfo | fn.GraphIoInfo>> {
  return await galleryPopup.openOverlayAsync<fn.FunctionInfo | fn.GraphIoInfo>({ntype});
}

async function flowDataInspector(): Promise<void> {
  // await dataInspectorPopup.openOverlayAsync<void>({}, {movable: true});
  showDataInspector = true;
  console.log("showDataInspector = true");
}

async function graphInputEditor(rawNodeId: number, dtypeStr: string, priorIoData: plstate.EncodedData | null, triggerRect: DOMRect): Promise<StatusOr<plstate.EncodedData>> {
  return await graphInputPopup.openOverlayAsync<plstate.EncodedData>({rawNodeId, dtypeStr, priorIoData, triggerRect}, {movable: true});
}

</script>

{#snippet renderFnGallery()}
  <FnGalleryV2 />
{/snippet}

{#snippet renderGraphInputEditor()}
  <ManualInputEditor />
{/snippet}

<!-- {#snippet renderDataInspector()}
  <FlowDataInspector />
{/snippet} -->

{#if showDataInspector}
  <Panel position="bottom-left">Hello in pane</Panel>
{/if}
