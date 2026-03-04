<script lang="ts">
  import { Handle, Position, type NodeProps } from "@xyflow/svelte";

  // Optional props

  const { data: nodeData }: NodeProps = $props();

  const width: number = 200;
  const height: number = 100;

  const path = "M 150,5 5,5 5,95 150,95 195,50 Z";

</script>

<div class="container">
  <svg class="nodebg" {width} {height} viewBox="0 0 {width} {height}">
    <path class="bg" d={path} />
    <path class="fg" d={path} />
  </svg>
  <div class="content">
    <span>{nodeData.label}</span>
  </div>
</div>
<Handle type="source" position={Position.Right} id="o1" title="slot: IN"/>

<style>
.container {
  --node-width: 100px;
  --node-height: 50px;
  --node-bg-color: #404040;
  --node-border-color: red; /* #404040; */
  width: var(--node-width);
  height: var(--node-height);
  position: relative;
  overflow: hidden;
  background: transparent;
}

.content {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
}

/* Re-enable pointer events only on the SVG */
svg.nodebg {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
}

.content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  pointer-events: none;

  padding-right: calc(var(--node-width) / 4);
  font-size: 0.675rem;

  /* background-color: #FF404044; */
}

path.bg {
  stroke: transparent;
  fill: none;
  stroke-width: 10;
  stroke-linejoin: round;
}

path.fg {
  stroke: var(--node-bg-color);
  fill: var(--node-bg-color);
  stroke-width: 8;
  stroke-linejoin: round;
}

svg.nodebg:hover path.bg {
  stroke: #D8D8D8;
}

/* Ensure only filled region receives pointer events */
path.fg {
  pointer-events: visiblePainted;
}
</style>
