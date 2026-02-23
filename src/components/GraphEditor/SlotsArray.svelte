<script lang="ts">
  import { onMount } from "svelte";
  import { Handle, Position } from "@xyflow/svelte";

  interface Slots {
    ins: string[];
    outs: string[];
    ios: string[];
  };

  interface Props {
    slots: Slots;
  };

  const { slots }: Props = $props();
  let containerDiv: HTMLDivElement;

  onMount(() => {
    console.log(containerDiv);
  });

</script>

<div class="container">
  <div class="row" bind:this={containerDiv}>
    <Handle type="target" id="m1" position={Position.Left} />
    <Handle type="source" id="m2" position={Position.Right} />
  </div>

  <div class="row" bind:this={containerDiv}>
    <Handle type="source" id="o1" position={Position.Right} />
  </div>

  <div class="row" bind:this={containerDiv}>
    <Handle type="target" id="i1" position={Position.Left} />
  </div>
</div>

<style>
.row {
  background-color: #88888822;
  position: relative;
  border-radius: 2px;
  min-height: 12px;
  margin-top: 2px;
  margin-bottom: 2px;
  margin-left: 0px;
  margin-right: 0px;
}
</style>