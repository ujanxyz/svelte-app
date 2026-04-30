<script lang="ts">
import * as ctxmenu from "@/modules/ctxmenu";
import * as overlay2 from "@/modules/overlay2";
import type { ClientXY, StatusOr } from "@/types/base";

import { registerGraphService } from "../graph-services";
import {
  connEndMenuItems,
  edgeMenuItems,
  nodeMenuItems,
  paneMenuItems, 
  selectionMenuItems,
} from "./menuData";

registerGraphService("menuService", {
  menuInPane: showInPaneContext,
  menuInNode: showInNodeContext,
  menuInEdge: showInEdgeContext,
  menuInSelection: showInSelectionContext,
  menuInConnEnd: showInConnEndContext,
});

const overlayMgr = overlay2.useOverlayManager();

async function openGraphContextMenu(
  clientXY: ClientXY,
  items: readonly ctxmenu.CtxMenuItem<string>[],
): Promise<StatusOr<string>> {
  const menuResult = await ctxmenu.openCtxMenu<string>(overlayMgr, renderContextMenu, {
    x: clientXY.x,
    y: clientXY.y,
    items,
  });
  if (menuResult.status === overlay2.overlayStatuses.OK) {
    return { status: "OK", value: menuResult.value.code };
  }

  return { status: menuResult.status, reason: menuResult.reason };
}

async function showInPaneContext(
  clientXY: ClientXY,
): Promise<StatusOr<string>> {
  return await openGraphContextMenu(clientXY, paneMenuItems);
}

async function showInNodeContext(
  clientXY: ClientXY,
): Promise<StatusOr<string>> {
  return await openGraphContextMenu(clientXY, nodeMenuItems);
}

async function showInEdgeContext(
  clientXY: ClientXY,
): Promise<StatusOr<string>> {
  return await openGraphContextMenu(clientXY, edgeMenuItems);
}

async function showInSelectionContext(
  clientXY: ClientXY,
): Promise<StatusOr<string>> {
  return await openGraphContextMenu(clientXY, selectionMenuItems);
}

async function showInConnEndContext(
  clientXY: ClientXY,
): Promise<StatusOr<string>> {
  return await openGraphContextMenu(clientXY, connEndMenuItems);
}

</script>

{#snippet renderContextMenu()}
  <ctxmenu.CtxMenuLayer />
{/snippet}
