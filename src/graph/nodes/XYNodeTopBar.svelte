<script lang="ts">
import { NodeToolbar, Position } from "@xyflow/svelte";
// Icons:
import EyeIcon from "phosphor-svelte/lib/EyeIcon";
import FunctionIcon from "phosphor-svelte/lib/FunctionIcon";
import SelectionIcon from "phosphor-svelte/lib/SelectionIcon";
import TrashIcon from "phosphor-svelte/lib/TrashIcon";

import type { plinfo } from "@/types/plinfo";

import IconButton from "../../components/IconButton.svelte";
import { getNodeContextOps } from "./nodeContextOps";

interface Props {
  ntype: plinfo.NodeInfo["ntype"];
  rawNodeId: number;
};

const { ntype, rawNodeId }: Props = $props();

const nodeCtxOps = getNodeContextOps();

function notImplemented() {
  alert("Function not implemented");
}

async function onSelfInput() {
    await nodeCtxOps.onSelfInput("3.1234");
}

async function onDeleteSelf() {
    await nodeCtxOps.onDeleteSelf();
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
