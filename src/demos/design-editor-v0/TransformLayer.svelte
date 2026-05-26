<script lang="ts">
import { onMount } from "svelte";

import type { base } from "@/types/base";

import ShapeHighlighter, { type ShapeHighlighterRect } from "./ShapeHighlighter.svelte";

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
  onMove?: (dx: number, dy: number) => void;
  onRotate?: (dRotationDeg: number) => void;
}

const {
  zoomLevel,
}: Props = $props();

let mode = $state<TransformMode>(null);
let txRect = $state<ShapeHighlighterRect | null>(null);
let viewportWidth = $state(1);
let viewportHeight = $state(1);
let rootEl = $state<HTMLDivElement | null>(null);

const projectedTxRect = $derived.by<ShapeHighlighterRect | null>(() => {
  if (!txRect) return null;

  return {
    x: (txRect.x - zoomLevel.x) * zoomLevel.zoom + viewportWidth / 2,
    y: (txRect.y - zoomLevel.y) * zoomLevel.zoom + viewportHeight / 2,
    width: txRect.width * zoomLevel.zoom,
    height: txRect.height * zoomLevel.zoom,
    rotationDeg: txRect.rotationDeg,
  };
});

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
    return;
  } else if (tx?.mode === "tx") {
    txRect = {
      x: tx.x,
      y: tx.y,
      width: tx.width,
      height: tx.height,
      rotationDeg: tx.rotationDeg,
    };
  }

  txRect = null;
}

onMount(() => {
  if (!rootEl) return;

  const syncViewport = (): void => {
    if (!rootEl) return;
    const rect = rootEl.getBoundingClientRect();
    viewportWidth = Math.max(1, rect.width);
    viewportHeight = Math.max(1, rect.height);
  };

  const ro = new ResizeObserver(() => {
    syncViewport();
  });

  syncViewport();
  ro.observe(rootEl);

  return () => {
    ro.disconnect();
  };
});

</script>

<div class="transform-layer" data-debug-name="transform-layer" bind:this={rootEl}>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox={`0 0 ${viewportWidth} ${viewportHeight}`}
    preserveAspectRatio="none"
    class="transform-layer__svg"
  >
    {#if mode === "hover" && projectedTxRect}
      <ShapeHighlighter rect={projectedTxRect} stroke="#7c3aed" strokeWidth={1.5} dashed />
    {:else if (mode === "tx" && projectedTxRect)}
      TransformFrame rect={projectedTxRect}
    {/if}
  </svg>
</div>

<style>
.transform-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  display: block;
}

.transform-layer__svg {
  display: block;
}
</style>