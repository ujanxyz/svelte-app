<script lang="ts">
import {
  BaseEdge,
  BezierEdge,
  type EdgeProps,
  EdgeToolbar,
  getBezierPath,
  getSmoothStepPath,
} from "@xyflow/svelte";

let { id, sourceX, sourceY, targetX, targetY, ...props }: EdgeProps = $props();
/* svelte-ignore state_referenced_locally */
const { markerStart, markerEnd, interactionWidth, label, labelStyle } = props;

// const [edgePath] = $derived(getBezierPath({
//     sourceX,
//     sourceY,
//     targetX,
//     targetY,
// }));
/* svelte-ignore state_referenced_locally */
const [edgePath, labelX, labelY] = $derived(
  getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  }),
);
console.log(edgePath);
</script>

<!-- <BaseEdge
  path={edgePath}
  {markerStart}
  {markerEnd}
  {interactionWidth}
  {label}
  {labelStyle}
/> -->

<!-- <path d={edgePath} class="thickpath"  fill="none" /> -->
<BaseEdge
  path={edgePath}
  {markerStart}
  {markerEnd}
  {interactionWidth}
  {label}
  {labelStyle}
/>

{#each Array(5).keys() as i}
  <circle r="3" fill="blue">
    <animateMotion
      dur="5s"
      repeatCount="indefinite"
      path={edgePath}
      begin="{i}s"
    />
  </circle>
{/each}

<EdgeToolbar edgeId={id} x={labelX} y={labelY} isVisible={false}>
  <button>{id}</button>
</EdgeToolbar>

<style>
.thickpath {
  stroke: #30c3d3;
  stroke-width: 20;
  stroke-opacity: 20%;
  stroke-dasharray: none;
  stroke-linecap: round;
}
</style>
