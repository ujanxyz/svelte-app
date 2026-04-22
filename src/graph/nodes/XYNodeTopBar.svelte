<script lang="ts">
import { NodeToolbar, Position } from "@xyflow/svelte";
// Icons:
import EyeIcon from "phosphor-svelte/lib/EyeIcon";
import FunctionIcon from "phosphor-svelte/lib/FunctionIcon";
import SelectionIcon from "phosphor-svelte/lib/SelectionIcon";
import TrashIcon from "phosphor-svelte/lib/TrashIcon";

import type { plinfo } from "@/types/plinfo";

import IconButton from "../../components/IconButton.svelte";

export interface ActionHandler {
  onSelfInput: () => Promise<void>;
  onDeleteSelf: () => Promise<void>;
}

interface Props {
  ntype: plinfo.NodeInfo["ntype"];
  actionHandler: ActionHandler;
};

const { ntype, actionHandler }: Props = $props();

function notImplemented() {
  alert("Function not implemented");
}

async function onSelfInput(): Promise<void> {
  await actionHandler.onSelfInput();
}

async function onDeleteSelf(): Promise<void> {
  await actionHandler.onDeleteSelf();
}
</script>

<NodeToolbar position={Position.Top} align="center">
  <div class="toolbar rounded-md">
    <IconButton tooltip="View data" onclick={onSelfInput}>
      <EyeIcon />
    </IconButton>
    <IconButton tooltip="Function info" onclick={notImplemented}>
      <FunctionIcon />
    </IconButton>
    <IconButton tooltip="See in props" onclick={notImplemented}>
      <SelectionIcon />
    </IconButton>
    <IconButton tooltip="Delete node" onclick={onDeleteSelf}>
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
