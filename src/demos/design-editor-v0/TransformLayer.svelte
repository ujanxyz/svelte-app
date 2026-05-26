<script lang="ts">
import type { base } from "@/types/base";

import ShapeHighlighter from "./ShapeHighlighter.svelte";
import TransformFrame, { type TransformFrameState } from "./TransformFrame.svelte";
import type { IDimension, RotatedRect } from "./types";

// Possible states:
// - hover: when hovering over a shape (not dragging), shows the highlighter.
// - tx: when transforming a shape (translate/resize)
// - line: when interacting with a line handle (e.g. end point of a line)
export type TransformMode = "hover" | "tx" | "line" | null;

export type StartTransform = {
  mode: "hover";
  x: number;
  y: number;
  width: number;
  height: number;
  rotationDeg: number;
} | {
  mode: "tx";
  x: number;
  y: number;
  width: number;
  height: number;
  rotationDeg: number;
  activePointer?: {
    pointerId: number;
    clientX: number;
    clientY: number;
  };
} | {
  mode: "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

interface Props {
  // Add zoom pan related props here if needed for the transform layer.
  zoomLevel: base.ZoomLevel;
  viewport: IDimension;
  onchange?: (next: RotatedRect) => void;
  onMove?: (dx: number, dy: number) => void;
  onRotate?: (dRotationDeg: number) => void;
}

const {
  zoomLevel,
  viewport,
  onchange,
}: Props = $props();

let mode = $state<TransformMode>(null);
let txRect = $state<RotatedRect | null>(null);
let activePointer = $state<{ pointerId: number; clientX: number; clientY: number } | null>(null);
let txSession = $state(0);

function worldToViewportRect(rect: RotatedRect): RotatedRect {
  return {
    x: (rect.x - zoomLevel.x) * zoomLevel.zoom + viewport.width / 2,
    y: (rect.y - zoomLevel.y) * zoomLevel.zoom + viewport.height / 2,
    width: rect.width * zoomLevel.zoom,
    height: rect.height * zoomLevel.zoom,
    rotationDeg: rect.rotationDeg,
  };
}

function viewportToWorldRect(rect: RotatedRect): RotatedRect {
  return {
    x: (rect.x - viewport.width / 2) / zoomLevel.zoom + zoomLevel.x,
    y: (rect.y - viewport.height / 2) / zoomLevel.zoom + zoomLevel.y,
    width: rect.width / zoomLevel.zoom,
    height: rect.height / zoomLevel.zoom,
    rotationDeg: rect.rotationDeg,
  };
}

const projectedTxRect = $derived.by<RotatedRect | null>(() => {
  if (!txRect) return null;

  return worldToViewportRect(txRect);
});

function onFrameChange(state: TransformFrameState): void {
  const nextProjected: RotatedRect = {
    x: state.centerX - state.width / 2,
    y: state.centerY - state.height / 2,
    width: state.width,
    height: state.height,
    rotationDeg: state.rotationDeg,
  };
  const nextWorld = viewportToWorldRect(nextProjected);
  txRect = nextWorld;
  onchange?.(nextWorld);
}

/**
 * Resets the transform on state change.
 * The transform contains the initial values for the specified mode.
 */
export function reset(tx: StartTransform | null): void {
  mode = tx ? tx.mode : null;
  if (tx?.mode === "hover") {
    txRect = {
      x: tx.x,
      y: tx.y,
      width: tx.width,
      height: tx.height,
      rotationDeg: tx.rotationDeg,
    };
    activePointer = null;
    return;
  } else if (tx?.mode === "tx") {
    txRect = {
      x: tx.x,
      y: tx.y,
      width: tx.width,
      height: tx.height,
      rotationDeg: tx.rotationDeg,
    };
    activePointer = tx.activePointer ?? null;
    txSession += 1;
    return;
  }

  if (tx?.mode !== "line") {
    txRect = null;
    activePointer = null;
  }
}

</script>

<div class="transform-layer" data-debug-name="transform-layer">
  {#if mode === "hover" && projectedTxRect}
    <ShapeHighlighter rect={projectedTxRect} viewport={viewport} stroke="#7c3aed" strokeWidth={1.5} dashed />
  {:else if (mode === "tx" && projectedTxRect)}
    {#key txSession}
      <TransformFrame initial={projectedTxRect} viewport={viewport} activePointer={activePointer} onchange={onFrameChange} />
    {/key}
  {/if}
</div>

<style>
.transform-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  display: block;
}

</style>