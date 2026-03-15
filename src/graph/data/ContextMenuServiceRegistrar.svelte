<script lang="ts">
// Icons.
import ArrowClockwiseIcon from "phosphor-svelte/lib/ArrowClockwiseIcon";
import ClipboardIcon from "phosphor-svelte/lib/ClipboardIcon";
import CodeIcon from "phosphor-svelte/lib/CodeIcon";
import InfoIcon from "phosphor-svelte/lib/InfoIcon";
import LineVerticalIcon from "phosphor-svelte/lib/LineVerticalIcon";
import PentagonIcon from "phosphor-svelte/lib/PentagonIcon";
import PlusIcon from "phosphor-svelte/lib/PlusIcon";
import StackMinusIcon from "phosphor-svelte/lib/StackMinusIcon";
import StackPlusIcon from "phosphor-svelte/lib/StackPlusIcon";
import TrashIcon from "phosphor-svelte/lib/TrashIcon";
import { type Snippet } from "svelte";

import MenuLayer from "../../overlay/context-menu/MenuLayer.svelte";
import { useOverlayUi } from "../../overlay/overlayStore";
import type { ClientXY, StatusOr } from "../../overlay/types";
import { MenuCodes } from "../constants";
import { registerGraphService } from "../graph-services";
import {
  connEndMenuData,
  edgeMenuData,
  nodeMenuData,
  paneMenuData,
  selectionMenuData,
} from "./menuData";

registerGraphService("menuService", {
  menuInPane: showInPaneContext,
  menuInNode: showInNodeContext,
  menuInEdge: showInEdgeContext,
  menuInSelection: showInSelectionContext,
  menuInConnEnd: showInConnEndContext,
});

const paneMenu = useOverlayUi(renderPaneMenu);
const nodeMenu = useOverlayUi(renderNodeMenu);
const edgeMenu = useOverlayUi(renderEdgeMenu);
const selectionMenu = useOverlayUi(renderSelectionMenu);
const connEndMenu = useOverlayUi(renderConnEndMenu);

async function showInPaneContext(
  clientXY: ClientXY,
): Promise<StatusOr<string>> {
  return await paneMenu.openOverlayAsync<string>({ clientXY });
}

async function showInNodeContext(
  clientXY: ClientXY,
): Promise<StatusOr<string>> {
  return await nodeMenu.openOverlayAsync<string>({ clientXY });
}

async function showInEdgeContext(
  clientXY: ClientXY,
): Promise<StatusOr<string>> {
  return await edgeMenu.openOverlayAsync<string>({ clientXY });
}

async function showInSelectionContext(
  clientXY: ClientXY,
): Promise<StatusOr<string>> {
  return await selectionMenu.openOverlayAsync<string>({ clientXY });
}

async function showInConnEndContext(
  clientXY: ClientXY,
): Promise<StatusOr<string>> {
  return await connEndMenu.openOverlayAsync<string>({ clientXY });
}

const icons: Record<string, Snippet> = {
  [MenuCodes.NEW_NODE]: plusIcon,
  [MenuCodes.NEW_INPUT]: plusIcon,
  [MenuCodes.NEW_OUTPUT]: plusIcon,
  [MenuCodes.RM_NODES]: trashIcon,
  [MenuCodes.RM_EDGES]: trashIcon,
  [MenuCodes.RM_NODE]: trashIcon,
  [MenuCodes.RM_EDGE]: trashIcon,
  [MenuCodes.RM_SELECTION]: trashIcon,
  [MenuCodes.PIPELINE_INFO]: infoIcon,
  [MenuCodes.NODE_INFO]: infoIcon,
  [MenuCodes.NODE_EXEC]: arrowClockwiseIcon,
  [MenuCodes.SELECTION_EXEC]: arrowClockwiseIcon,
};
</script>

{#snippet renderPaneMenu()}
  <MenuLayer menuItems={paneMenuData} {icons} defaultIcon={lineVerticalIcon} />
{/snippet}

{#snippet renderNodeMenu()}
  <MenuLayer menuItems={nodeMenuData} {icons} defaultIcon={lineVerticalIcon} />
{/snippet}

{#snippet renderEdgeMenu()}
  <MenuLayer menuItems={edgeMenuData} {icons} defaultIcon={lineVerticalIcon} />
{/snippet}

{#snippet renderConnEndMenu()}
  <MenuLayer
    menuItems={connEndMenuData}
    {icons}
    defaultIcon={lineVerticalIcon}
  />
{/snippet}

{#snippet renderSelectionMenu()}
  <MenuLayer
    menuItems={selectionMenuData}
    {icons}
    defaultIcon={lineVerticalIcon}
  />
{/snippet}
<!-- Icons --------------------------------------------------------------------------------------->

{#snippet arrowClockwiseIcon()}
  <ArrowClockwiseIcon size={24} />
{/snippet}

{#snippet codeIcon()}
  <CodeIcon size={24} />
{/snippet}

{#snippet clipboardIcon()}
  <ClipboardIcon size={24} />
{/snippet}

{#snippet infoIcon()}
  <InfoIcon size={24} />
{/snippet}

{#snippet pentagonIcon()}
  <PentagonIcon size={24} />
{/snippet}

{#snippet plusIcon()}
  <PlusIcon size={24} />
{/snippet}

{#snippet stackPlusIcon()}
  <StackPlusIcon size={24} />
{/snippet}

{#snippet stackMinusIcon()}
  <StackMinusIcon size={24} />
{/snippet}

{#snippet lineVerticalIcon()}
  <LineVerticalIcon size={24} />
{/snippet}

{#snippet trashIcon()}
  <TrashIcon size={24} />
{/snippet}
