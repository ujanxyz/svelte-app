<script lang="ts">
import { onDestroy, onMount } from "svelte";

import ShapeHighlighter from "./ShapeHighlighter.svelte";
import TransformFrame, { type TransformFrameState } from "./TransformFrame.svelte";
import TransformLineHandle, { type TransformLineState } from "./TransformLineHandle.svelte";
import type { CanvasElement } from "./types";

type TransformPatch = Partial<CanvasElement>;

type Props = {
  viewportW: number;
  viewportH: number;
  pageOffsetX: number;
  pageOffsetY: number;
  hovered?: CanvasElement | null;
  selected?: CanvasElement | null;
  showBounds?: boolean;
  showTransforms?: boolean;
  onTransform?: (payload: { id: string; patch: TransformPatch }) => void;
  onTransformEnd?: (payload: { id: string; patch: TransformPatch }) => void;
};

const {
  viewportW,
  viewportH,
  pageOffsetX,
  pageOffsetY,
  hovered = null,
  selected = null,
  showBounds = true,
  showTransforms = true,
  onTransform,
  onTransformEnd,
}: Props = $props();

let transformVisible = $state(showTransforms);
let boundsVisible = $state(showBounds);
let pendingPatch = $state<TransformPatch | null>(null);
let pendingId = $state<string | null>(null);

const overlayStyle = $derived(`width: ${viewportW}px; height: ${viewportH}px;`);

function rectFromElement(el: CanvasElement): { x: number; y: number; width: number; height: number; rotationDeg: number } {
  if (el.type === "line") {
    const b = el.getBounds();
    return {
      x: pageOffsetX + b.x,
      y: pageOffsetY + b.y,
      width: b.width,
      height: b.height,
      rotationDeg: 0,
    };
  }

  return {
    x: pageOffsetX + el.x,
    y: pageOffsetY + el.y,
    width: el.width,
    height: el.height,
    rotationDeg: el.rotation || 0,
  };
}

const hoverRect = $derived(hovered ? rectFromElement(hovered) : null);

export function showTransformsHandle(show = true): void {
  transformVisible = show;
}

export function showBoundsHandle(show = true): void {
  boundsVisible = show;
}

function onFrameChange(next: TransformFrameState): void {
  if (!selected || selected.type === "line") return;

  const x = next.centerX - next.width / 2 - pageOffsetX;
  const y = next.centerY - next.height / 2 - pageOffsetY;

  const patch: TransformPatch = {
    x,
    y,
    width: next.width,
    height: next.height,
    rotation: next.rotationDeg,
  };

  pendingPatch = patch;
  pendingId = selected.id;
  onTransform?.({ id: selected.id, patch });
}

function onLineChange(next: TransformLineState): void {
  if (!selected || selected.type !== "line") return;

  const x1 = next.x1 - pageOffsetX;
  const y1 = next.y1 - pageOffsetY;
  const x2 = next.x2 - pageOffsetX;
  const y2 = next.y2 - pageOffsetY;

  const patch: TransformPatch = {
    x: x1,
    y: y1,
    x2,
    y2,
    width: x2 - x1,
    height: y2 - y1,
  };

  pendingPatch = patch;
  pendingId = selected.id;
  onTransform?.({ id: selected.id, patch });
}

function flushCommit(): void {
  if (!pendingPatch || !pendingId) return;
  onTransformEnd?.({ id: pendingId, patch: pendingPatch });
  pendingPatch = null;
  pendingId = null;
}

const onWindowPointerUp = (): void => {
  flushCommit();
};

onMount(() => {
  window.addEventListener("pointerup", onWindowPointerUp);
  window.addEventListener("pointercancel", onWindowPointerUp);
});

onDestroy(() => {
  window.removeEventListener("pointerup", onWindowPointerUp);
  window.removeEventListener("pointercancel", onWindowPointerUp);
});
</script>

<div class="select-layer" style={overlayStyle}>
  <svg width="100%" height="100%" viewBox={`0 0 ${viewportW} ${viewportH}`}>
    {#if boundsVisible && hoverRect && !selected}
      <ShapeHighlighter rect={hoverRect} stroke="#7c3aed" strokeWidth={1.25} />
    {/if}
  </svg>

  {#if transformVisible && selected && selected.type !== "line"}
    {@const centerX = pageOffsetX + selected.x + selected.width / 2}
    {@const centerY = pageOffsetY + selected.y + selected.height / 2}
    {#key selected.id}
      <TransformFrame
        initialCenterX={centerX}
        initialCenterY={centerY}
        initialWidth={selected.width}
        initialHeight={selected.height}
        initialRotationDeg={selected.rotation}
        onchange={onFrameChange}
      />
    {/key}
  {/if}

  {#if transformVisible && selected && selected.type === "line"}
    {@const lx1 = pageOffsetX + selected.x}
    {@const ly1 = pageOffsetY + selected.y}
    {@const lx2 = pageOffsetX + (selected.x2 ?? selected.x + selected.width)}
    {@const ly2 = pageOffsetY + (selected.y2 ?? selected.y + selected.height)}
    {#key selected.id}
      <TransformLineHandle
        initialX1={lx1}
        initialY1={ly1}
        initialX2={lx2}
        initialY2={ly2}
        onchange={onLineChange}
      />
    {/key}
  {/if}
</div>

<style>
.select-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
}

.select-layer :global(svg) {
  pointer-events: none;
}

.select-layer :global(.tf-layer),
.select-layer :global(.tl-layer) {
  pointer-events: auto;
}
</style>
