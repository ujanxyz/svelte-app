<script lang="ts">
  import SlotsArray from "./SlotsArray.svelte";
  import { onDestroy, onMount } from "svelte";
  import { NodeToolbar, Position, type NodeProps } from "@xyflow/svelte";
  import IconButton from "../../components/IconButton.svelte";
  import { HorseIcon, HeartIcon } from "phosphor-svelte";
  import CubeIcon from "phosphor-svelte/lib/CubeIcon";
  import TrashIcon from "phosphor-svelte/lib/TrashIcon";

  const { data: nodeData }: NodeProps = $props();
  const { label } = nodeData as { label: string };

  let containerDiv: HTMLDivElement | undefined;
  const slots = {
    ins: ["x1", "x2"],
    outs: ["y1", "y2"],
    ios: ["m1"],
  };

  onMount(() => {
  });

  onDestroy(() => {
    containerDiv = undefined;
  });


</script>

<div bind:this={containerDiv} class="compact-card">
  <h3 class="card-title">Title: {label}</h3>
  <NodeToolbar position={Position.Top} align="center">
    <div class="toolbar rounded-md">
      <IconButton tooltip="Hello" onclick={() => alert(9)} />
      <IconButton tooltip="Hello" onclick={() => alert(9)} />
      <IconButton tooltip="Hello" onclick={() => alert(9)} />

        <HorseIcon />
<HeartIcon color="#AE2983" weight="fill" size={24} />
<TrashIcon size={24} />
    </div>
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
  .toolbar {
    --comp-icon-btn-border-col: transparent;
    --comp-icon-btn-border-col-hover: transparent;
    --comp-icon-btn-bg: pink;
    background-color: var(--color-bg-3);
    padding: var(--space-2) var(--space-3);
    display: flex;
    align-items: center;
    column-gap: var(--space-2);
  }
</style>