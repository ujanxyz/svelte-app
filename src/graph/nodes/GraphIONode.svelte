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

const actionHandler: ActionHandler = {

  onSelfInput: async function (): Promise<void> {
    const rect = canvasRef!.getBoundingClientRect();
    await nodeOps.onGraphInput(slotInfo.dtype, nodeState.encodedData, rect);
  },

  onDeleteSelf: async function (): Promise<void> {
    throw new Error("Delete action not implemented for GraphIONode yet");
  }
};

async function handlePaneClick(ev: MouseEvent): Promise<void> {
  ev.preventDefault();
  const rect = canvasRef!.getBoundingClientRect();
  await nodeOps.onGraphInput(slotInfo.dtype, nodeState.encodedData, rect);
}

async function handleExpand(ev: MouseEvent): Promise<void> {
  await nodeOps.expandPreview(slotInfo, nodeState.encodedData);
}

</script>

<div class="node-shell">
  <NodeHeader label={`${rawNodeId} / ${nodeState.label}`} {nodeId} />
  <div class="content">
    <PreviewCanvas {slotInfo} {nodeOps} onclick={handlePaneClick} bind:canvasRef={canvasRef} />
  </div>
  <button onclick={handleExpand}>Expand</button>

  {#if graphIONodeData.info.ntype === "OUT"}
    <MyHandle kind="in" id={slotInfo.name} />
  {:else if graphIONodeData.info.ntype === "IN"}
    <MyHandle kind="out" id={slotInfo.name} />
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
