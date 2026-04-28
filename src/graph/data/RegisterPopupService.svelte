<script lang="ts">
import { Panel } from "@xyflow/svelte";

import ManualInputEditor, { type ManualInputOverlayPayload } from "@/graph/data/ManualInputEditor.svelte";
import { createOverlayController, type OverlayResult,overlayStatuses, useOverlayManager } from "@/modules/overlay2";
import type { fn } from "@/types/function";
import type { plinfo } from "@/types/plinfo";
import type { plstate } from "@/types/plstate";

import FnGalleryV2, { type FnGalleryPayload } from "../../modules/fngallery/FnGalleryV2.svelte";
import { type StatusOr } from "../../overlay/types";
import { registerGraphService } from "../graph-services";

type Ntype = plinfo.NodeInfo["ntype"];

const overlayMgr = useOverlayManager();
const fnGallery = createOverlayController<FnGalleryPayload, fn.FunctionInfo | fn.GraphIoInfo>(overlayMgr, renderFnGallery);
const manualInput = createOverlayController<ManualInputOverlayPayload, plstate.EncodedData>(overlayMgr, renderGraphInputEditor);

registerGraphService("popupService", {
  nodeTemplateGallery,
  flowDataInspector,
  encodedDataEditor,
});

const showDataInspector = $state<boolean>(false);

async function nodeTemplateGallery(ntype: Ntype): Promise<StatusOr<fn.FunctionInfo | fn.GraphIoInfo>> {
  const result: OverlayResult<fn.FunctionInfo | fn.GraphIoInfo> = await fnGallery.open({ ntype: "IN" });
  if (result.status === overlayStatuses.OK) {
    console.log("Selected item:", result.value);
    return { status: "OK", value: result.value };
  } else {
    console.log("Gallery dismissed with status:", result.status);
    return { status: "DISMISSED", reason: result.status };
  }
}

async function flowDataInspector(): Promise<void> {
  // await dataInspectorPopup.openOverlayAsync<void>({}, {movable: true});
}

async function encodedDataEditor(rawNodeId: number, dtypeStr: string, priorIoData: plstate.EncodedData | null, triggerRect: DOMRect): Promise<StatusOr<plstate.EncodedData>> {
  const result = await manualInput.open({rawNodeId, dtypeStr, priorIoData, triggerRect});
  if (result.status === overlayStatuses.OK) {
    return { status: "OK", value: result.value };
  } else {
    return { status: "DISMISSED", reason: result.status };
  }
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
