<script lang="ts">
import { getContext, type Snippet } from "svelte";
import { CONTXT_KEY_XY_ACTIONS, MenuCodes } from "./constants";
import { useOverlayUi } from "../../overlay/overlayStore";
import {
  edgeMenuData,
  nodeMenuData,
  paneMenuData,
  selectionMenuData,
} from "./menuData";
import MenuLayer from "../../overlay/context-menu/MenuLayer.svelte";
import type { XYActions } from "./types";
import type { ClientXY, StatusOr } from "../../overlay/types";

// Icons.
import ArrowClockwiseIcon from "phosphor-svelte/lib/ArrowClockwiseIcon";
import ClipboardIcon from "phosphor-svelte/lib/ClipboardIcon";
import CodeIcon from "phosphor-svelte/lib/CodeIcon";
import InfoIcon from "phosphor-svelte/lib/InfoIcon";
import LineVerticalIcon from "phosphor-svelte/lib/LineVerticalIcon";
import PentagonIcon from "phosphor-svelte/lib/PentagonIcon";
import PlusIcon from "phosphor-svelte/lib/PlusIcon";
import StackPlusIcon from "phosphor-svelte/lib/StackPlusIcon";
import StackMinusIcon from "phosphor-svelte/lib/StackMinusIcon";
import TrashIcon from "phosphor-svelte/lib/TrashIcon";
import FnGalleryV2 from "../../modules/fngallery/FnGalleryV2.svelte";

const xyActions = getContext(CONTXT_KEY_XY_ACTIONS) as XYActions;

$effect.pre(() => {
  xyActions.menuInPane = showInPaneContext;
  xyActions.menuInNode = showInNodeContext;
  xyActions.menuInEdge = showInEdgeContext;
  xyActions.menuInSelection = showInSelectionContext;
  xyActions.popupGallery = popupGallery;
});

const paneMenu = useOverlayUi(renderPaneMenu);
const nodeMenu = useOverlayUi(renderNodeMenu);
const edgeMenu = useOverlayUi(renderEdgeMenu);
const selectionMenu = useOverlayUi(renderSelectionMenu);
const galleryPopup = useOverlayUi(renderGalleryPopup);

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

async function popupGallery(): Promise<StatusOr<string>> {
  return await galleryPopup.openOverlayAsync<string>({});
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

{#snippet renderSelectionMenu()}
  <MenuLayer
    menuItems={selectionMenuData}
    {icons}
    defaultIcon={lineVerticalIcon}
  />
{/snippet}

{#snippet renderGalleryPopup()}
  <FnGalleryV2 />
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
