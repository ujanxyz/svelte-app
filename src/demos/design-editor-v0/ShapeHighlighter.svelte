<script lang="ts">
import type { IDimension } from "./types";

export type ShapeHighlighterRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotationDeg?: number;
};

type Props = {
  rect: ShapeHighlighterRect;
  viewport: IDimension;
  stroke?: string;
  strokeWidth?: number;
  dashed?: boolean;
};

const {
  rect,
  viewport,
  stroke = "#7c3aed",
  strokeWidth = 1.5,
  dashed = true,
}: Props = $props();

const cx = $derived(rect.x + rect.width / 2);
const cy = $derived(rect.y + rect.height / 2);
const rotationDeg = $derived(rect.rotationDeg ?? 0);
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={viewport.width}
  height={viewport.height}
  viewBox={`0 0 ${viewport.width} ${viewport.height}`}
  preserveAspectRatio="none"
  class="shape-highlighter"
>
  <g transform={`rotate(${rotationDeg} ${cx} ${cy})`}>
    <rect
      x={rect.x}
      y={rect.y}
      width={rect.width}
      height={rect.height}
      fill="none"
      stroke={stroke}
      stroke-width={strokeWidth}
      stroke-linejoin="round"
      stroke-dasharray={dashed ? "6 4" : undefined}
      vector-effect="non-scaling-stroke"
    />
  </g>
</svg>

<!-- TODO: accept an array of rects when multi-selection highlight is enabled. -->

<style>
.shape-highlighter {
  display: block;
  pointer-events: none;
}
</style>
