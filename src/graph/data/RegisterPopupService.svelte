<script lang="ts" module>
import type { Snippet } from "svelte";

import * as ctxmenu from "@/modules/ctxmenu";
import * as overlay2 from "@/modules/overlay2";
import type { ClientXY, StatusOr } from "@/types/base";

async function _internalOpenContextMenu(
  overlayMgr: overlay2.OverlayManager,
  clientXY: ClientXY,
  menuSnippetFn: Snippet,
  items: readonly ctxmenu.CtxMenuItem<string>[],
): Promise<StatusOr<string>> {
  const menuResult = await ctxmenu.openCtxMenu<string>(overlayMgr, menuSnippetFn, {
    x: clientXY.x,
    y: clientXY.y,
    items,
  });
  if (menuResult.status === overlay2.overlayStatuses.OK) {
    return { status: "OK", value: menuResult.value.code };
  }
  return { status: menuResult.status, reason: menuResult.reason };
}
</script>

<script lang="ts">
import ManualInputEditor, { type ManualInputOverlayPayload } from "@/graph/data/ManualInputEditor.svelte";
import MediaManager from "@/modules/fngallery/MediaManager.svelte";
import { createOverlayController, type OverlayResult,overlayStatuses, useOverlayManager } from "@/modules/overlay2";
import type { fn } from "@/types/function";
import type { plinfo } from "@/types/plinfo";
import type { plstate } from "@/types/plstate";

import FnGalleryV2, { type FnGalleryPayload } from "../../modules/fngallery/FnGalleryV2.svelte";
import { registerGraphService } from "../graph-services";
import {
  connEndMenuItems,
  edgeMenuItems,
  nodeMenuItems,
  paneMenuItems, 
  selectionMenuItems,
} from "./menuData";

type Ntype = plinfo.NodeInfo["ntype"];

const overlayMgr = useOverlayManager();
const mediaManager = createOverlayController<{}, void>(overlayMgr, renderMediaManager);
const fnGallery = createOverlayController<FnGalleryPayload, fn.FunctionInfo | fn.GraphIoInfo>(overlayMgr, renderFnGallery);
const manualInput = createOverlayController<ManualInputOverlayPayload, plstate.EncodedData>(overlayMgr, renderGraphInputEditor);

registerGraphService("popupService", {
  mediaManagerModal,
  nodeTemplateGallery,
  encodedDataEditor,
  ... _contextMenuApiImpls(overlayMgr),
});

async function mediaManagerModal(): Promise<void> {
  await mediaManager.open({});
}

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

async function encodedDataEditor(rawNodeId: number, dtypeStr: string, priorIoData: plstate.EncodedData | null, triggerRect: DOMRect): Promise<StatusOr<plstate.EncodedData>> {
  const result = await manualInput.open({rawNodeId, dtypeStr, priorIoData, triggerRect});
  if (result.status === overlayStatuses.OK) {
    return { status: "OK", value: result.value };
  } else {
    return { status: "DISMISSED", reason: result.status };
  }
}

function _contextMenuApiImpls(overlayMgr: overlay2.OverlayManager) {
  return {
    menuInPane: async (clientXY: ClientXY): Promise<StatusOr<string>> => {
      return _internalOpenContextMenu(overlayMgr, clientXY, renderCtxMenu, paneMenuItems);
    },

    menuInNode: async (clientXY: ClientXY): Promise<StatusOr<string>> => {
      return _internalOpenContextMenu(overlayMgr, clientXY, renderCtxMenu, nodeMenuItems);
    },

    menuInEdge: async (clientXY: ClientXY): Promise<StatusOr<string>> => {
      return _internalOpenContextMenu(overlayMgr, clientXY, renderCtxMenu, edgeMenuItems);
    },

    menuInSelection: async (clientXY: ClientXY): Promise<StatusOr<string>> => {
      return _internalOpenContextMenu(overlayMgr, clientXY, renderCtxMenu, selectionMenuItems);
    },

    menuInConnEnd: async (clientXY: ClientXY): Promise<StatusOr<string>> => {
      return _internalOpenContextMenu(overlayMgr, clientXY, renderCtxMenu, connEndMenuItems);
    },
  };
}

</script>
{#snippet renderCtxMenu()}
  <ctxmenu.CtxMenuLayer />
{/snippet}

{#snippet renderMediaManager()}
  <MediaManager />
{/snippet}

{#snippet renderFnGallery()}
  <FnGalleryV2 />
{/snippet}

{#snippet renderGraphInputEditor()}
  <ManualInputEditor />
{/snippet}
