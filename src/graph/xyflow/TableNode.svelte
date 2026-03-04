<script lang="ts">
  import type { NodeProps } from "@xyflow/svelte";
  import { Handle, Position } from "@xyflow/svelte";
  import { onMount } from "svelte";
  let { data }: NodeProps = $props();
  let handle1: Handle;

  const inputs = [
    "aaaa",
    "bbb",
    "cccc",
  ];
  const rowHeight = 50;

  onMount(() => {
    console.log(handle1);
  });

  const top = 15;
</script>
<div class="root">
  <h3 class="card-title">Card Title</h3>
  <div class="custom">Test</div>
</div>
<Handle type="target" position={Position.Left} title="slot: IN" class="handle-top" bind:this={handle1}/>
<Handle type="source" position={Position.Bottom} title="slot: IN" class={"!custom"} style={`top:${top}px`}>KOP</Handle>
<Handle type="source" position={Position.Right}/>

{#each inputs as input, i}
    <Handle
      type="target"
      id={`inp-${i}`}
      position={Position.Left}
      style={`top:${i * rowHeight + 12}px`}
    />
{/each}

<style>
  .custom {
    --xy-handle-border-color-default: #a11717;
    background-color: yellow;
  }
  .root {
    background-color: var(--color-bg-panel);
    color: var(--color-text-secondary);
    border: 0.5px solid var(--color-border-default);
    border-radius: 2px;
    padding: 8px;
    display: flex;
    flex-direction: column;
  }
  .handle-top {
    top: 10px;
  }
</style>