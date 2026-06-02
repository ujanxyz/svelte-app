<script lang="ts">
import type { base } from "@/types/base";

import CubicBezierEditor from "./CubicBezierEditor.svelte";
import DeepEdit from "./DeepEdit.svelte";
import ElementActionBar from "./ElementActionBar.svelte";
import ShapeHighlighter from "./ShapeHighlighter.svelte";
import TransformEditor from "./TransformEditor.svelte";
import type { EditableCubicBezierPath, IDimension, RotatedRect } from "./types";

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
};

interface Props {
  // Add zoom pan related props here if needed for the transform layer.
  zoomLevel: base.ZoomLevel;
  viewport: IDimension;
  viewDimension: IDimension;
  onchange: (next: RotatedRect) => void;
  activeGraphicType?: string | null;
  deepEditCoords?: base.XYPosition[] | null;
  deepEditBezierPath?: EditableCubicBezierPath | null;
  ondeepeditcoordschange?: (coords: base.XYPosition[]) => void;
  ondeepeditbezierchange?: (path: EditableCubicBezierPath) => void;
}

const {
  zoomLevel,
  viewport,
  viewDimension,
  onchange,
  activeGraphicType = null,
  deepEditCoords = null,
  deepEditBezierPath = null,
  ondeepeditcoordschange,
  ondeepeditbezierchange,
}: Props = $props();

let mode = $state<TransformMode>(null);
let txRect = $state<RotatedRect | null>(null);
let activePointer = $state<{ pointerId: number; clientX: number; clientY: number } | null>(null);
let txSession = $state(0);
let ui = $state.raw({
  editorIsInteracting: false,
  deepEditMode: null as null | "polygon" | "bezier",
});

const ACTION_BAR_HEIGHT = 42;
const ACTION_BAR_WIDTH = 150;
const ACTION_BAR_EDGE_GAP = 32; // 2rem at 16px root font size
const ACTION_BAR_OBJECT_GAP = 12;
const ACTION_BAR_MIN_SIDE_PADDING = 8;

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

const transformedOuterBounds = $derived.by<{
  x: number;
  y: number;
  width: number;
  height: number;
} | null>(() => {
  if (!projectedTxRect || (mode !== "tx" && mode !== "line")) return null;

  const rect = projectedTxRect;
  const rotation = ((rect.rotationDeg ?? 0) * Math.PI) / 180;
  const isLine = mode === "line";
  const centerX = rect.x;
  const centerY = rect.y;
  const halfW = rect.width / 2;
  const halfH = isLine ? 0 : rect.height / 2;

  const corners: Array<{ x: number; y: number }> = [
    { x: -halfW, y: -halfH },
    { x: halfW, y: -halfH },
    { x: halfW, y: halfH },
    { x: -halfW, y: halfH },
  ].map((corner) => {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    return {
      x: centerX + corner.x * cos - corner.y * sin,
      y: centerY + corner.x * sin + corner.y * cos,
    };
  });

  const xs = corners.map((corner) => corner.x);
  const ys = corners.map((corner) => corner.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
});

const showActionBar = $derived.by(() => {
  return (mode === "tx" || mode === "line") && !!projectedTxRect && !ui.editorIsInteracting && ui.deepEditMode === null && !!transformedOuterBounds;
});

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Places the floating action bar with a predictable top/bottom strategy.
 *
 * Algorithm summary:
 * 1) Try top-middle above the transformed bounds.
 * 2) If top is not valid, try bottom-middle below the bounds.
 * 3) If neither side fully fits with the preferred edge gap, choose the side
 *    that is closer to fitting and pin the bar just inside that canvas edge.
 *
 * The horizontal position is centered on the target bounds and clamped so the
 * bar stays within the viewport side padding.
 */
function computeActionBarPosition(
  bounds: { x: number; y: number; width: number; height: number },
  canvas: IDimension,
): { left: number; top: number } {
  const centerX = bounds.x + bounds.width / 2;
  const minLeft = ACTION_BAR_WIDTH / 2 + ACTION_BAR_MIN_SIDE_PADDING;
  const maxLeft = Math.max(minLeft, canvas.width - ACTION_BAR_WIDTH / 2 - ACTION_BAR_MIN_SIDE_PADDING);
  const left = clamp(centerX, minLeft, maxLeft);

  const topCandidateBottomY = bounds.y - ACTION_BAR_OBJECT_GAP;
  const topCandidateTopY = topCandidateBottomY - ACTION_BAR_HEIGHT;
  const bottomCandidateTopY = bounds.y + bounds.height + ACTION_BAR_OBJECT_GAP;
  const bottomCandidateBottomY = bottomCandidateTopY + ACTION_BAR_HEIGHT;

  const topFits = topCandidateTopY >= 0;
  const topGapToCanvasEdge = topCandidateBottomY;
  if (topFits && topGapToCanvasEdge >= ACTION_BAR_EDGE_GAP) {
    return { left, top: topCandidateBottomY };
  }

  const bottomFits = bottomCandidateBottomY <= canvas.height;
  const bottomGapToCanvasEdge = canvas.height - bottomCandidateTopY;
  if (bottomFits && bottomGapToCanvasEdge >= ACTION_BAR_EDGE_GAP) {
    return { left, top: bottomCandidateBottomY };
  }

  const topDistance = Math.abs(topCandidateBottomY);
  const bottomDistance = Math.abs(canvas.height - bottomCandidateTopY);
  if (topDistance <= bottomDistance) {
    return { left, top: ACTION_BAR_HEIGHT };
  }

  return { left, top: canvas.height };
}

const actionBarPosition = $derived.by(() => {
  if (!transformedOuterBounds || (mode !== "tx" && mode !== "line")) return null;
  return computeActionBarPosition(transformedOuterBounds, viewport);
});

function onEditorChange(next: RotatedRect): void {
  const nextWorld = viewportToWorldRect(next);
  txRect = nextWorld;
  onchange?.(nextWorld);
}

function onEditorInteractionChange(active: boolean): void {
  ui = {
    ...ui,
    editorIsInteracting: active,
  };
}

function onActionButtonClick(name: string): void {
  console.log(name);
  // TODO: Wire action bar commands.
}

function closeDeepEdit(): void {
  ui = {
    ...ui,
    deepEditMode: null,
  };
}

function onDeepEditCoordsChange(coords: base.XYPosition[]): void {
  ondeepeditcoordschange?.(coords);
}

function onDeepEditBezierChange(path: EditableCubicBezierPath): void {
  ondeepeditbezierchange?.(path);
}

function onLayerDoubleClick(): void {
  const canEditMode = mode === "tx" || mode === "hover";
  if (!canEditMode) return;

  if (activeGraphicType === "polygon" && deepEditCoords && deepEditCoords.length >= 3) {
    ui = {
      ...ui,
      deepEditMode: "polygon",
    };
    return;
  }

  if (activeGraphicType === "cubic-bezier" && deepEditBezierPath && deepEditBezierPath.segments.length >= 2) {
    ui = {
      ...ui,
      deepEditMode: "bezier",
    };
  }
}

function clearDeepEditMode(): void {
  ui = {
    ...ui,
    deepEditMode: null,
  };
}

function setTxRect(next: StartTransform): void {
  txRect = {
    x: next.x,
    y: next.y,
    width: next.width,
    height: next.height,
    rotationDeg: next.rotationDeg,
  };
}

/**
 * Resets the transform on state change.
 * The transform contains the initial values for the specified mode.
 */
export function reset(tx: StartTransform | null): void {
  if (!tx) {
    clearDeepEditMode();
  }
  mode = tx ? tx.mode : null;
  if (tx?.mode === "hover") {
    setTxRect(tx);
    activePointer = null;
    return;
  }

  if (tx?.mode === "tx" || tx?.mode === "line") {
    setTxRect(tx);
    activePointer = tx.activePointer ?? null;
    txSession += 1;
    return;
  }

  txRect = null;
  activePointer = null;
}

</script>

<div class="transform-layer" data-debug-name="transform-layer" ondblclick={onLayerDoubleClick} role="presentation">
  {#if mode === "hover" && projectedTxRect}
    <ShapeHighlighter rect={projectedTxRect} viewport={viewport} stroke="#7c3aed" strokeWidth={1.5} dashed />
  {:else if (mode === "tx" && projectedTxRect)}
    {#key txSession}
      <TransformEditor mode="frame" initial={projectedTxRect} viewport={viewport} activePointer={activePointer} onchange={onEditorChange} onInteractionChange={onEditorInteractionChange} />
    {/key}
  {:else if (mode === "line" && projectedTxRect)}
    {#key txSession}
      <TransformEditor mode="line" initial={projectedTxRect} viewport={viewport} activePointer={activePointer} lockAspectRatio={false} disableFlip={true} disableSkew={true} onchange={onEditorChange} onInteractionChange={onEditorInteractionChange} />
    {/key}
  {/if}

  {#if ui.deepEditMode === "polygon" && activeGraphicType === "polygon" && deepEditCoords}
    <DeepEdit shapeType={activeGraphicType} coords={deepEditCoords} viewDimension={viewDimension} zoomLevel={zoomLevel} onclose={closeDeepEdit} oncoordschange={onDeepEditCoordsChange} />
  {/if}

  {#if ui.deepEditMode === "bezier" && activeGraphicType === "cubic-bezier" && deepEditBezierPath}
    <CubicBezierEditor shapeType={activeGraphicType} path={deepEditBezierPath} viewDimension={viewDimension} zoomLevel={zoomLevel} onclose={closeDeepEdit} onpathchange={onDeepEditBezierChange} />
  {/if}

  {#if showActionBar && actionBarPosition}
    <ElementActionBar coordinate={actionBarPosition} onaction={onActionButtonClick} />
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