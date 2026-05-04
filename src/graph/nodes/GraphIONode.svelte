<script lang="ts">
import { onMount } from "svelte";

import type { plstate } from "@/types/plstate";
import type { xy } from "@/types/xy";

import MyHandle from "./MyHandle.svelte";
import { setNodeContextOps } from "./nodeContextOps";
import XYNodeTopBar, { type ActionHandler } from "./XYNodeTopBar.svelte";
import type { plinfo } from "@/types/plinfo";

const {
  data: baseNodeData,
  id: nodeId,
  ...restProps
}: xy.xyNodeProps = $props();

/* svelte-ignore state_referenced_locally */
const graphIONodeData = baseNodeData as xy.xyGraphIoNodeData;

/* svelte-ignore state_referenced_locally */
const slotInfo = graphIONodeData.slotInfo;

/* svelte-ignore state_referenced_locally */
const nodeOps = setNodeContextOps(graphIONodeData.info);

const nodeState = $derived(nodeOps.reactiveNodeState()) as plstate.NodeState;

// The preview canvas is attached to this container div.
let contentDiv: HTMLDivElement;
let canvasRef: HTMLCanvasElement;

let refDataButton: HTMLButtonElement;

const actionHandler: ActionHandler = {

  onSelfInput: async function (): Promise<void> {
    const rect = (refDataButton as HTMLButtonElement).getBoundingClientRect();
    await nodeOps.onGraphInput(slotInfo.dtype, nodeState.encodedData, rect);
  },

  onDeleteSelf: async function (): Promise<void> {
    throw new Error("Delete action not implemented for GraphIONode yet");
  }
};

async function handlePaneClick(ev: MouseEvent): Promise<void> {
  ev.preventDefault();
  const anchor = refDataButton || (ev.currentTarget as HTMLButtonElement);
  const rect = anchor.getBoundingClientRect();
  await nodeOps.onGraphInput(slotInfo.dtype, nodeState.encodedData, rect);
}

onMount(() => {
  if (graphIONodeData.slotInfo.dtype !== "bitmap") return;
  let registrationKey: string;
  canvasRef.width = 120;
  canvasRef.height = 120;
  nodeOps.registerPreview(slotInfo, canvasRef).then((regKey: string) => {
    registrationKey = regKey;
  }).catch((err) => console.error(err));

  return () => {
    if (registrationKey) {
      nodeOps.unregisterPreview(registrationKey).catch((err) => console.error(err));
    }
  };
});

</script>

<div class="nodebar">
  <span>{nodeState.label}</span>
</div>
<div class="content" bind:this={contentDiv}>
  <canvas bind:this={canvasRef}></canvas>
  <button onclick={handlePaneClick} bind:this={refDataButton}>
    {nodeState.encodedData?.payload ?? "n/a"}
  </button>

  ntype={graphIONodeData.info.ntype}, dtype={graphIONodeData.slotInfo.dtype}
  {#if graphIONodeData.info.ntype === "IN" && graphIONodeData.slotInfo.dtype === "bitmap"}
    File upload here !!
  {/if}
</div>

{#if graphIONodeData.info.ntype === "OUT"}
  <MyHandle kind="in" id={slotInfo.name} />
{:else if graphIONodeData.info.ntype === "IN"}
  <MyHandle kind="out" id={slotInfo.name} />
{/if}

<XYNodeTopBar ntype={graphIONodeData.info.ntype} {actionHandler} />

<style>
:global(.svelte-flow .svelte-flow__node) {
  background: var(--color-bg-3);
  border: 1px solid var(--color-bg-4);
}

.nodebar {
  height: calc(0.6rem + 4px);
  padding: 2px;
  font-size: 0.4rem;
  background-color: rgba(55, 55, 214, 0.508);
}
.content {
  width: 100%;
  padding: 6px;

  font-size: 0.675rem;
}
</style>
