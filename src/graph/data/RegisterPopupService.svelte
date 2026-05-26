<script lang="ts" module>
import type { Snippet } from "svelte";

import * as ctxmenu from "@/modules/ctxmenu";
import * as overlay2 from "@/modules/overlay2";
import type { base } from "@/types/base";

async function _internalOpenContextMenu(
  overlayMgr: overlay2.OverlayManager,
  clientXY: base.XYPosition,
  menuSnippetFn: Snippet,
  items: readonly ctxmenu.CtxMenuItem<string>[],
): Promise<base.StatusOr<string>> {
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
//-------------------------------------------------------------------------------
import FunctionGallery from "@/features/func-gallery/FunctionGallery.svelte";
import IoGallery, { type IoGalleryPayload } from "@/features/func-gallery/IoGallery.svelte";
import ImageViewer from "@/features/image-viewer/ImageViewer.svelte";
import MediaManager from "@/features/media-manager/MediaManager.svelte";
import ManualInputEditor, { type ManualInputOverlayPayload } from "@/graph/data/ManualInputEditor.svelte";
import { createOverlayController, type OverlayResult,overlayStatuses, useOverlayManager } from "@/modules/overlay2";
import type { fn } from "@/types/function";
import type { grph } from "@/types/grph";

import { registerGraphService } from "../graph-services";
import {
  connEndMenuItems,
  edgeMenuItems,
  nodeMenuItems,
  paneMenuItems, 
  selectionMenuItems,
} from "./menuData";

type Ntype = grph.NodeInfo["ntype"];

const overlayMgr = useOverlayManager();
const mediaManager = createOverlayController<{}, void>(overlayMgr, renderMediaManager);
const imageViewer = createOverlayController<{assetUri: string}, void>(overlayMgr, renderImgViewer);
const fnGallery = createOverlayController<{}, fn.FunctionInfo | fn.GraphIoInfo>(overlayMgr, renderFnGallery);
const ioGallery = createOverlayController<IoGalleryPayload, string>(overlayMgr, renderIoGallery);
const manualInput = createOverlayController<ManualInputOverlayPayload, grph.EncodedData>(overlayMgr, renderGraphInputEditor);

registerGraphService("popupService", {
  mediaManagerModal,
  imgViewerModal,
  nodeTemplateGallery,
  encodedDataEditor,
  ... _contextMenuApiImpls(overlayMgr),
});

async function mediaManagerModal(): Promise<void> {
  await mediaManager.open({});
}

async function imgViewerModal(assetUri: string): Promise<void> {
  await imageViewer.open({assetUri});
}

async function nodeTemplateGallery(ntype: Ntype): Promise<base.StatusOr<fn.FunctionInfo | fn.GraphIoInfo>> {
  if (ntype === "FN") {
    const result: OverlayResult<fn.FunctionInfo | fn.GraphIoInfo> = await fnGallery.open({ ntype });
    if (result.status === overlayStatuses.OK) {
      console.log("Selected item:", result.value);
      return { status: "OK", value: result.value };
    }
    console.log("Gallery dismissed with status:", result.status);
    return { status: "DISMISSED", reason: result.status };
  }

  const ioResult: OverlayResult<string> = await ioGallery.open({ ntype });
  if (ioResult.status === overlayStatuses.OK) {
    const ioInfo: fn.GraphIoInfo = {
      dtype: ioResult.value,
      uri: (ntype === "IN" ? "/$IN/" : "/$OUT/") + ioResult.value,
    };
    return { status: "OK", value: ioInfo };
  }

  return { status: "DISMISSED", reason: ioResult.status };
}

async function encodedDataEditor(rawNodeId: number, dtypeStr: string, priorIoData: grph.EncodedData | null, triggerRect: DOMRect): Promise<base.StatusOr<grph.EncodedData>> {
  const result = await manualInput.open({rawNodeId, dtypeStr, priorIoData, triggerRect});
  if (result.status === overlayStatuses.OK) {
    return { status: "OK", value: result.value };
  } else {
    return { status: "DISMISSED", reason: result.status };
  }
}

function _contextMenuApiImpls(overlayMgr: overlay2.OverlayManager) {
  return {
    menuInPane: async (clientXY: base.XYPosition): Promise<base.StatusOr<string>> => {
      return _internalOpenContextMenu(overlayMgr, clientXY, renderCtxMenu, paneMenuItems);
    },

    menuInNode: async (clientXY: base.XYPosition): Promise<base.StatusOr<string>> => {
      return _internalOpenContextMenu(overlayMgr, clientXY, renderCtxMenu, nodeMenuItems);
    },

    menuInEdge: async (clientXY: base.XYPosition): Promise<base.StatusOr<string>> => {
      return _internalOpenContextMenu(overlayMgr, clientXY, renderCtxMenu, edgeMenuItems);
    },

    menuInSelection: async (clientXY: base.XYPosition): Promise<base.StatusOr<string>> => {
      return _internalOpenContextMenu(overlayMgr, clientXY, renderCtxMenu, selectionMenuItems);
    },

    menuInConnEnd: async (clientXY: base.XYPosition): Promise<base.StatusOr<string>> => {
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

{#snippet renderImgViewer()}
  <ImageViewer />
{/snippet}

{#snippet renderFnGallery()}
  <FunctionGallery />
{/snippet}

{#snippet renderIoGallery()}
  <IoGallery />
{/snippet}

{#snippet renderGraphInputEditor()}
  <ManualInputEditor />
{/snippet}
