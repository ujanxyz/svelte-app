<script lang="ts">
  import { ContextMenu } from '../overlay';
  import type { MenuItem, OverlayChildUse } from '../overlay/types';
  import useUiRegistry from '../overlay/useUiRegistry';

  const paneCtx: MenuItem[] = [
    { label: "New Node ..."},  // handler: () => console.log("New node")
    { label: "New Cluster ..."},
		"-",
    { label: "New Input ..."},
    { label: "New Output ..."},
		"-",
    { label: "Clear Edges", shortcut: "Ctrl+E"},
    { label: "Clear Graph", shortcut: "Ctrl+G"},
		"-",
    { label: "Center viewport"},
    { label: "Fit to view"}, // handler: () => alert('fit to view...')
		"-",
    { label: "Pipeline Info"},
	];
 
  const nodeCtx: MenuItem[] = [
    { label: "Delete Node"},
		"-",
    { label: "Node Info"},
	];

  const { registerUI } = useUiRegistry();
  registerUI("pane", paneCtxMenu);
  registerUI("node", nodeCtxMenu);

</script>

{#snippet paneCtxMenu(overlayUse: OverlayChildUse)}
  <ContextMenu {overlayUse} menuItems={paneCtx}/>
{/snippet}

{#snippet nodeCtxMenu(overlayUse: OverlayChildUse)}
  <ContextMenu {overlayUse} menuItems={nodeCtx}/>
{/snippet}

<!-- No HTML template, everything via UI registration above -->
