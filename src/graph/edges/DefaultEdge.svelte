<script lang="ts">
import {
  BaseEdge,
  BezierEdge,
  EdgeToolbar,
  getBezierPath,
  getSmoothStepPath,
  type EdgeProps,
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

</script>

<!-- <BaseEdge
  path={edgePath}
  {markerStart}
  {markerEnd}
  {interactionWidth}
  {label}
  {labelStyle}
/> -->

<BaseEdge
  path={edgePath}
  {markerStart}
  {markerEnd}
  {interactionWidth}
  {label}
  {labelStyle}
/>
<circle r="4" fill="#ff00ff">
  <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
</circle>
<EdgeToolbar edgeId={id} x={labelX} y={labelY} isVisible={false}>
	<button>{id}</button>
</EdgeToolbar>