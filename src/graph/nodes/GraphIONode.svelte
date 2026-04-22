<script lang="ts">
import { Handle, Position } from "@xyflow/svelte";

import type { plstate } from "@/types/plstate";
import type { xy } from "@/types/xy";

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

const nodeState = $derived(nodeOps.reactiveNodeState()) as plstate.NodeState;

let refDataButton: HTMLButtonElement;

const actionHandler: ActionHandler = {

  onSelfInput: async function (): Promise<void> {
    const rect = (refDataButton as HTMLButtonElement).getBoundingClientRect();
    console.log(graphIONodeData, nodeState);

    const data: plstate.EncodedData = nodeState.ioData ?? {
      payload: "",
    };
    switch (graphIONodeData.slotInfo.dtype) {
      case "floats":
        data.payload = "[3.5555]";
        break;
      case "points2d":
        data.payload = '[{"x":1.357, "y":2.468}]';
        break;
      default:
        throw new Error("Unsupported dtype: " + graphIONodeData.slotInfo.dtype);
    }
    await nodeOps.onGraphInput(slotInfo.dtype, data, rect);
  },

  onDeleteSelf: async function (): Promise<void> {
    await nodeOps.onDeleteSelf();
  }
};

async function handlePaneClick(ev: MouseEvent): Promise<void> {
  ev.preventDefault();
  const anchor = refDataButton || (ev.currentTarget as HTMLButtonElement);
  const rect = anchor.getBoundingClientRect();
  await nodeOps.onGraphInput(slotInfo.dtype, nodeState.ioData, rect);
}


</script>

<div class="container">
  <div class="nodebar">
    <span>{nodeState.label}</span>
  </div>
  <div class="content">
    <button onclick={handlePaneClick} bind:this={refDataButton}>
      {nodeState.ioData?.payload ?? "n/a"}
    </button>
  </div>
</div>
<Handle type="source" position={Position.Right} id="o1" title="slot: IN" />

{#if graphIONodeData.info.ntype === "OUT"}
  <MyHandle kind="in" id={slotInfo.name} />
{:else if graphIONodeData.info.ntype === "IN"}
  <MyHandle kind="out" id={slotInfo.name} />
{/if}

<XYNodeTopBar ntype={graphIONodeData.info.ntype} {actionHandler} />

<style>
.container {
  --node-width: 100px;
  --node-height: 50px;
  --node-bg-color: #404040;
  --node-border-color: rgb(19, 77, 159); /* #404040; */
  width: var(--node-width);
  height: var(--node-height);
  position: relative;
  overflow: hidden;
  background: rgb(29, 49, 125);
  font-size: 0.4rem;

  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
}
.nodebar {
  height: calc(0.6rem + 4px);
  padding: 2px;
  background-color: #3a516c;
  font-size: 0.4rem;
}
.content {
  padding-right: calc(var(--node-width) / 4);
  font-size: 0.675rem;
  background-color: #FF404044;
}

</style>
