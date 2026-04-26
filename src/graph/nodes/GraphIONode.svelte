<script lang="ts">
import { onMount } from "svelte";

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
const slotInfo = graphIONodeData.slotInfo;

/* svelte-ignore state_referenced_locally */
const nodeOps = setNodeContextOps(graphIONodeData.info);

const nodeState = $derived(nodeOps.reactiveNodeState()) as plstate.NodeState;

// The preview canvas is attached to this container div.
let contentDiv: HTMLDivElement;

let refDataButton: HTMLButtonElement;

const actionHandler: ActionHandler = {

  onSelfInput: async function (): Promise<void> {
    const rect = (refDataButton as HTMLButtonElement).getBoundingClientRect();
    await nodeOps.onGraphInput(slotInfo.dtype, nodeState.encodedData, rect);
  },

  onDeleteSelf: async function (): Promise<void> {
    await nodeOps.getPreviewCanvas(slotInfo).then((canvas) => {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }).catch((err) => {
      console.error("Error clearing preview canvas: ", err);
    });
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
  let previewCanvas: HTMLCanvasElement | null = null;
  nodeOps.getPreviewCanvas(slotInfo).then((canvas) => {
    previewCanvas = canvas;
    contentDiv.appendChild(previewCanvas);
  }).catch((err) => {
    console.error("Error getting preview canvas: ", err);
  });

  return () => {
    if (previewCanvas) {
      contentDiv.removeChild(previewCanvas);
    }
  };
});

</script>

<div class="nodebar">
  <span>{nodeState.label}</span>
</div>
<div class="content" bind:this={contentDiv}>
  <button onclick={handlePaneClick} bind:this={refDataButton}>
    {nodeState.encodedData?.payload ?? "n/a"}
  </button>
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
