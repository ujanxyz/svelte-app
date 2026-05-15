<script lang="ts">
import PreviewCanvas from "@/graph/components/PreviewCanvas.svelte";
import type { grph } from "@/types/grph";
import type { xy } from "@/types/xy";

import NodeHeader from "../components/NodeHeader.svelte";
import MyHandle from "./MyHandle.svelte";
import { setNodeContextOps } from "./nodeContextOps";
import XYNodeTopBar, { type ActionHandler } from "./XYNodeTopBar.svelte";

const {
  data: baseNodeData,
  id: nodeId,
  ...restProps
}: xy.xyNodeProps = $props();

/* svelte-ignore state_referenced_locally */
const graphIONodeData = baseNodeData as xy.xyGraphIoNodeData;

/* svelte-ignore state_referenced_locally */
const rawNodeId: number = graphIONodeData.info.rawId;

/* svelte-ignore state_referenced_locally */
const slotInfo = graphIONodeData.slotInfo;

/* svelte-ignore state_referenced_locally */
const nodeOps = setNodeContextOps(graphIONodeData.info);

const nodeState = $derived(nodeOps.reactiveNodeState()) as grph.NodeState;

let canvasRef: HTMLCanvasElement | undefined = $state();

async function onZoomClick(): Promise<void> {
  await nodeOps.expandPreview(slotInfo, nodeState.encodedData);
}

async function onEditClick(): Promise<void> {
  const rect = canvasRef!.getBoundingClientRect();
  await nodeOps.onGraphInput(slotInfo.dtype, nodeState.encodedData, rect);
}

const actionHandler: ActionHandler = {
  onSelfInput: onEditClick,
  onDeleteSelf: async function (): Promise<void> {
    throw new Error("Delete action not implemented for GraphIONode yet");
  }
};

</script>

<div class="node-shell">
  <NodeHeader label={`${rawNodeId} / ${nodeState.label}`} {nodeId} />
  <div class="content">
    <PreviewCanvas {slotInfo} {nodeOps} {onZoomClick} {onEditClick} bind:canvasRef={canvasRef} />
  </div>
  {#if graphIONodeData.info.ntype === "OUT"} 
    {@const handleId = slotInfo.name + "/in"}
    <MyHandle kind="in" id={handleId} />
  {:else if graphIONodeData.info.ntype === "IN"}
    {@const handleId = slotInfo.name + "/out"}
    <MyHandle kind="out" id={handleId} />
  {/if}
</div>

<XYNodeTopBar ntype={graphIONodeData.info.ntype} {actionHandler} />

<style>
.node-shell {
  display: flex;
  flex-direction: column;
}

.content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2) 0;
}
</style>
