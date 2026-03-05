<script lang="ts">
import { NodeToolbar, Position } from "@xyflow/svelte";
import IconButton from "../../components/IconButton.svelte";
// Icons:
import EyeIcon from "phosphor-svelte/lib/EyeIcon";
import FunctionIcon from "phosphor-svelte/lib/FunctionIcon";
import SelectionIcon from "phosphor-svelte/lib/SelectionIcon";
import TrashIcon from "phosphor-svelte/lib/TrashIcon";
import useNodeOpsContext from "./useNodeOpsContext";

const nodeOps = useNodeOpsContext().getNodeOps();

function notImplemented() {
  alert("Function not implemented");
}
</script>

<NodeToolbar position={Position.Top} align="center">
  <div class="toolbar rounded-md">
    <IconButton tooltip="View data" onclick={notImplemented}>
      <EyeIcon />
    </IconButton>
    <IconButton tooltip="Function info" onclick={notImplemented}>
      <FunctionIcon />
    </IconButton>
    <IconButton tooltip="See in props" onclick={notImplemented}>
      <SelectionIcon />
    </IconButton>
    <IconButton tooltip="Delete node" onclick={() => nodeOps.deleteSelf()}>
      <TrashIcon />
    </IconButton>
  </div>
</NodeToolbar>

<style>
.toolbar {
  --comp-icon-btn-border-col: transparent;
  --comp-icon-btn-border-col-hover: transparent;
  background-color: var(--color-bg-3);
  padding: var(--space-2) var(--space-3);
  display: flex;
  align-items: center;
  column-gap: var(--space-2);
}
</style>
