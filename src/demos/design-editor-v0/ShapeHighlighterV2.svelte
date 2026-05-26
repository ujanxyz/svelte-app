<script lang="ts">
import type { RotatedRect } from "./types";

type Props = {
  rect: RotatedRect;
  stroke?: string;
  strokeWidth?: number;
  dashed?: boolean;
};

const {
  rect,
  stroke = "#7c3aed",
  strokeWidth = 1.5,
  dashed = true,
}: Props = $props();

const cx = $derived(rect.x + rect.width / 2);
const cy = $derived(rect.y + rect.height / 2);
const rotationDeg = $derived(rect.rotationDeg ?? 0);
</script>

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

<!-- TODO: accept an array of rects when multi-selection highlight is enabled. -->
