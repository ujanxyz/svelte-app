<script lang="ts">
  import { ContextMenu } from '../overlay';
  import type { MenuActionHandler, MenuItem, OverlayChildUse } from '../overlay/types';
  import useUiRegistry from '../overlay/useUiRegistry';
  import { MenuCodes } from './constants';

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

  const menuActions: Record<string, MenuActionHandler> = {
    [MenuCodes.NEW_NODE]: _newNode,
    [MenuCodes.NEW_INPUT]: _newInput,
  };

  const { registerUI } = useUiRegistry();
  registerUI("pane", paneCtxMenu);
  registerUI("node", nodeCtxMenu);

  function _newNode() {
    console.log("New node ..");
  }

  function _newInput() {
    console.log("New input ..");
  }

</script>

{#snippet paneCtxMenu(overlayUse: OverlayChildUse)}
  <ContextMenu {overlayUse} menuItems={paneCtx} {menuActions}/>
{/snippet}

{#snippet nodeCtxMenu(overlayUse: OverlayChildUse)}
  <ContextMenu {overlayUse} menuItems={nodeCtx} {menuActions}/>
{/snippet}

<!-- No HTML template, everything via UI registration above -->
