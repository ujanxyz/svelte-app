<script lang="ts">
import {
  BaseEdge,
  BezierEdge,
  getBezierPath,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/svelte";

let { sourceX, sourceY, targetX, targetY, ...props }: EdgeProps = $props();
/* svelte-ignore state_referenced_locally */
const { markerStart, markerEnd, interactionWidth, label, labelStyle } = props;

// const [edgePath] = $derived(getBezierPath({
//     sourceX,
//     sourceY,
//     targetX,
//     targetY,
// }));
/* svelte-ignore state_referenced_locally */
const [edgePath] = $derived(
  getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    stepPosition: 1, // edge break closer to target node
    borderRadius: 7,
  }),
);

const animated = true;
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
