<script lang="ts">
import PreviewCanvas from "@/graph/components/PreviewCanvas.svelte";
import type { grph } from "@/types/grph";
import type { xy } from "@/types/xy";

import MyHandle from "../components/MyHandle.svelte";
import NodeHeader from "../components/NodeHeader.svelte";
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
const slotState = $derived(nodeOps.reactiveSlotState(slotInfo.name)) as grph.SlotState;

let anchorContainerRef: HTMLDivElement | undefined = $state();

async function onZoomClick(): Promise<void> {
  await nodeOps.expandPreview();
}

async function onEditClick(): Promise<void> {
  const rect = anchorContainerRef!.getBoundingClientRect();
  await nodeOps.onSlotInput(slotInfo, $state.snapshot(slotState), rect);
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
    {#if slotInfo.dtype === "bitmap"}
      <div class="content" bind:this={anchorContainerRef}>
        <PreviewCanvas {slotInfo} {nodeOps} {onZoomClick} {onEditClick} />
      </div>
    {:else}
      {@const slotState = nodeOps.reactiveSlotState(slotInfo.name)}
      <div class="flex-fitted-rows" bind:this={anchorContainerRef}>
        <button onclick={onEditClick}>Edit {slotInfo.name}</button>
      </div>
    {/if}
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
/* TODO: Re-factor this with SlotsArray  */
.flex-fitted-rows {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: stretch;
  row-gap: var(--space-1);

  padding: 0 var(--space-1);
}

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
