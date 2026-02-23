<script lang="ts">
  import type { Edge, Node } from '@xyflow/svelte';
  import { EventKinds } from '../../utils/constants';
  import useEventDispatch from '../../utils/useEventDispatch';
  import { ContextMenu } from '../overlay';
  import type { MenuActionHandler, MenuItem, OverlayChildUse } from '../overlay/types';
  import useUiRegistry from '../overlay/useUiRegistry';
  import { MenuCodes, OverlayTriggers } from './constants';

  const paneCtx: MenuItem[] = [
    { code: MenuCodes.NEW_NODE, label: "New Node ..."},  // handler: () => console.log("New node")
    { code: MenuCodes.NEW_INPUT, label: "New Input ..."},
    { code: MenuCodes.NEW_OUTPUT, label: "New Output ..."},
		"-",
    { code: MenuCodes.RM_NODES, label: "Clear Graph", shortcut: "Ctrl+G"},
    { code: MenuCodes.RM_EDGES, label: "Clear Edges", shortcut: "Ctrl+E"},
		"-",
    { code: MenuCodes.PIPELINE_INFO, label: "Pipeline Info"},
	];
 
  const nodeCtx: MenuItem[] = [
    { code: MenuCodes.RM_NODE, label: "Delete Node"},
		"-",
    { code: MenuCodes.NODE_INFO, label: "Node Info"},
	];

  const edgeCtx: MenuItem[] = [
    { code: MenuCodes.RM_EDGE, label: "Delete Edge"},
	];

  const dispatchRmNode = useEventDispatch(EventKinds.XY_RM_NODE);
  const dispatchRmEdge = useEventDispatch(EventKinds.XY_RM_EDGE);

  const menuActions: Record<string, MenuActionHandler> = {
    [MenuCodes.NEW_NODE]: _newNode,
    [MenuCodes.NEW_INPUT]: _newInput,
    [MenuCodes.RM_NODE]: _rmNode,
    [MenuCodes.RM_EDGE]: _rmEdge,
  };

  const { registerUI } = useUiRegistry();
  registerUI(OverlayTriggers.PANE_CTX_MENU, paneCtxMenu);
  registerUI(OverlayTriggers.NODE_CTX_MENU, nodeCtxMenu);
  registerUI(OverlayTriggers.EDGE_CTX_MENU, edgeCtxMenu);

  function _newNode(payload: any) {
    console.log("New node .. ", payload);
  }

  function _newInput(payload: any) {
    console.log("New input ..", payload);
  }

  function _rmNode(payload: any) {
    const nodeId = (payload.node as Node).id as string;
    dispatchRmNode({nodeId});
  }

  function _rmEdge(payload: any) {
    const edgeId = (payload.edge as Edge).id as string;
    dispatchRmEdge({edgeId});
  }

</script>

{#snippet paneCtxMenu(overlayUse: OverlayChildUse)}
  <ContextMenu {overlayUse} menuItems={paneCtx} {menuActions}/>
{/snippet}

{#snippet nodeCtxMenu(overlayUse: OverlayChildUse)}
  <ContextMenu {overlayUse} menuItems={nodeCtx} {menuActions}/>
{/snippet}

{#snippet edgeCtxMenu(overlayUse: OverlayChildUse)}
  <ContextMenu {overlayUse} menuItems={edgeCtx} {menuActions}/>
{/snippet}

<!-- No HTML template, everything via UI registration above -->
