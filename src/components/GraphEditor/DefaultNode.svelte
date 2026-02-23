<script lang="ts">
  import SlotsArray from "./SlotsArray.svelte";
  import { onDestroy, onMount, setContext } from "svelte";
  import type { NodeContext, TopLeftPosition } from "./types";
  import { NodeToolbar, type NodeProps } from "@xyflow/svelte";

  const { data: nodeData }: NodeProps = $props();
  const { label } = nodeData as { label: string };

  let containerDiv: HTMLDivElement | undefined;
  const slots = {
    ins: ["x1", "x2"],
    outs: ["y1", "y2"],
    ios: ["m1"],
  };

  setContext<NodeContext>("node", {addSlot});

  function addSlot(slotDiv: HTMLDivElement, topLeft: TopLeftPosition) {
  }

  onMount(() => {
  });

  onDestroy(() => {
    console.log("Called onDetroy !!!.... ");
    containerDiv = undefined;
  });


</script>

<div bind:this={containerDiv} class="compact-card">
  <h3 class="card-title">Title: {label}</h3>
  <NodeToolbar>
	<button>delete</button>
	<button>copy</button>
	<button>expand</button>
  </NodeToolbar>
  <a href="#" class="card-button">View</a>
  <SlotsArray {slots} />
</div>


<style>
  .compact-card {
    font-size: smaller;
    display: flex;
    flex-direction: column;
    gap: 2px;
    height: fit-content;
  }
  .card-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
  }
  .card-desc {
    font-size: 0.9rem;
    color: #666;
    margin: 0;
  }
</style>