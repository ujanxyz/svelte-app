<script module lang="ts">
const MIN_WIDTH = 36;
const MIN_HEIGHT = 36;
const MIN_LINE_LENGTH = 1;
const DEFAULT_FRAME_STROKE = "#7c3aed";
const DEFAULT_LINE_STROKE = "#0f766e";
</script>

<script lang="ts">
import { onDestroy, onMount } from "svelte";

import type { IDimension, Point, RotatedRect } from "./types";

export type TransformEditorMode = "frame" | "line";

type ResizeHandle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

type Interaction =
  | {
      mode: "move";
      pointerId: number;
      startPointer: Point;
      startCenter: Point;
    }
  | {
      mode: "rotate";
      pointerId: number;
      startCenter: Point;
      startPointerAngle: number;
      startRotationRad: number;
    }
  | {
      mode: "resize";
      handle: ResizeHandle;
      pointerId: number;
      startPointer: Point;
      startCenter: Point;
      startWidth: number;
      startHeight: number;
      startRotationRad: number;
      startFlipX: boolean;
      startFlipY: boolean;
    }
  | {
      mode: "shear-x";
      pointerId: number;
      startPointer: Point;
      startSkewXDeg: number;
      startFrameH: number;
      startRotationRad: number;
      startFlipX: boolean;
      startFlipY: boolean;
    }
  | {
      mode: "shear-y";
      pointerId: number;
      startPointer: Point;
      startSkewYDeg: number;
      startFrameW: number;
      startRotationRad: number;
      startFlipX: boolean;
      startFlipY: boolean;
    }
  | {
      mode: "line-start";
      pointerId: number;
      fixedEnd: Point;
    }
  | {
      mode: "line-end";
      pointerId: number;
      fixedStart: Point;
    };

type Props = {
  mode?: TransformEditorMode;
  initial?: RotatedRect;
  viewport: IDimension;
  activePointer?: {
    pointerId: number;
    clientX: number;
    clientY: number;
  } | null;
  lockAspectRatio?: boolean;
  disableFlip?: boolean;
  disableSkew?: boolean;
  strokeColor?: string;
  onchange?: (next: RotatedRect) => void;
  onInteractionChange?: (active: boolean) => void;
};

type PointerCaptureElement = EventTarget & {
  setPointerCapture?: (pointerId: number) => void;
  releasePointerCapture?: (pointerId: number) => void;
  hasPointerCapture?: (pointerId: number) => boolean;
};

const {
  mode = "frame",
  initial = { x: 340, y: 220, width: 240, height: 150, rotationDeg: -10 },
  viewport,
  activePointer = null,
  lockAspectRatio = false,
  disableFlip = false,
  disableSkew = false,
  strokeColor,
  onchange,
  onInteractionChange,
}: Props = $props();

let layerEl: SVGSVGElement;

let centerX = $state(340);
let centerY = $state(220);
let frameW = $state(240);
let frameH = $state(150);
let rotationDeg = $state(-10);
let flipX = $state(false);
let flipY = $state(false);
let skewXDeg = $state(0);
let skewYDeg = $state(0);
let interaction = $state.raw<Interaction | null>(null);
let capturedPointer = $state.raw<{ pointerId: number; element: PointerCaptureElement } | null>(null);

const isLineMode = $derived(mode === "line");
const effectiveStrokeColor = $derived(strokeColor ?? (isLineMode ? DEFAULT_LINE_STROKE : DEFAULT_FRAME_STROKE));
const effectiveLockAspectRatio = $derived(isLineMode ? false : lockAspectRatio);
const canFlip = $derived(!isLineMode && !effectiveLockAspectRatio && !disableFlip);
const canSkew = $derived(!isLineMode && !effectiveLockAspectRatio && !disableSkew);
const canSideResize = $derived(!isLineMode && !effectiveLockAspectRatio);
const MAX_SKEW_DEG = 60;

const contentBounds = $derived.by(() => {
  const tanX = Math.tan((skewXDeg * Math.PI) / 180);
  const tanY = Math.tan((skewYDeg * Math.PI) / 180);
  const w = frameW;
  const h = frameH;

  const corners: [number, number][] = [
    [-w / 2, -h / 2],
    [w / 2, -h / 2],
    [w / 2, h / 2],
    [-w / 2, h / 2],
  ].map(([x, y]) => {
    const sx = x + y * tanX;
    return [sx, y + sx * tanY];
  });

  const xs = corners.map(([x]) => x);
  const ys = corners.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
});

const baseBounds = $derived.by(() => ({
  x: -frameW / 2,
  y: -frameH / 2,
  w: frameW,
  h: frameH,
}));

const rotationRad = $derived((rotationDeg * Math.PI) / 180);
const lineDir = $derived({ x: Math.cos(rotationRad), y: Math.sin(rotationRad) });
const lineStart = $derived({ x: centerX - (lineDir.x * frameW) / 2, y: centerY - (lineDir.y * frameW) / 2 });
const lineEnd = $derived({ x: centerX + (lineDir.x * frameW) / 2, y: centerY + (lineDir.y * frameW) / 2 });
const linePerp = $derived({ x: -lineDir.y, y: lineDir.x });
const lineRotateHandle = $derived({ x: centerX + linePerp.x * 34, y: centerY + linePerp.y * 34 });

function isSideResizeHandle(handle: ResizeHandle): boolean {
  return handle === "n" || handle === "s" || handle === "e" || handle === "w";
}

function getHandleAffects(handle: ResizeHandle): {
  affectsRight: boolean;
  affectsLeft: boolean;
  affectsTop: boolean;
  affectsBottom: boolean;
} {
  return {
    affectsRight: handle === "e" || handle === "ne" || handle === "se",
    affectsLeft: handle === "w" || handle === "nw" || handle === "sw",
    affectsTop: handle === "n" || handle === "ne" || handle === "nw",
    affectsBottom: handle === "s" || handle === "se" || handle === "sw",
  };
}

function toPointerInLayer(ev: PointerEvent): Point {
  const rect = layerEl.getBoundingClientRect();
  return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
}

function toLayerPoint(clientX: number, clientY: number): Point {
  const rect = layerEl.getBoundingClientRect();
  return { x: clientX - rect.left, y: clientY - rect.top };
}

function rotateVec(x: number, y: number, radians: number): Point {
  const c = Math.cos(radians);
  const s = Math.sin(radians);
  return { x: x * c - y * s, y: x * s + y * c };
}

function pointerAngle(pointer: Point, c: Point): number {
  return Math.atan2(pointer.y - c.y, pointer.x - c.x);
}

function emitChange(): void {
  if (isLineMode) {
    onchange?.({
      x: centerX,
      y: centerY,
      width: frameW,
      height: 0,
      rotationDeg,
    });
    return;
  }

  onchange?.({
    x: centerX,
    y: centerY,
    width: frameW,
    height: frameH,
    rotationDeg,
  });
}

function setInteraction(next: Interaction | null): void {
  interaction = next;
  onInteractionChange?.(next !== null);
}

function capturePointerById(pointerId: number): void {
  const target = layerEl as unknown as PointerCaptureElement;
  if (!target?.setPointerCapture) return;
  try {
    target.setPointerCapture(pointerId);
    capturedPointer = {
      pointerId,
      element: target,
    };
  } catch {
    capturedPointer = null;
  }
}

function releaseCapturedPointer(pointerId: number): void {
  if (!capturedPointer || capturedPointer.pointerId !== pointerId) return;

  const { element } = capturedPointer;
  try {
    if (!element.releasePointerCapture) {
      capturedPointer = null;
      return;
    }

    if (!element.hasPointerCapture || element.hasPointerCapture(pointerId)) {
      element.releasePointerCapture(pointerId);
    }
  } catch {
    // Ignore release errors from stale/disconnected nodes.
  }

  capturedPointer = null;
}

function beginInteraction(next: Interaction, ev: PointerEvent): void {
  setInteraction(next);
  capturePointerById(ev.pointerId);
}

function beginMove(ev: PointerEvent): void {
  if (ev.button !== 0) return;
  ev.preventDefault();
  beginInteraction({
    mode: "move",
    pointerId: ev.pointerId,
    startPointer: toPointerInLayer(ev),
    startCenter: { x: centerX, y: centerY },
  }, ev);
}

function beginRotate(ev: PointerEvent): void {
  if (ev.button !== 0) return;
  ev.preventDefault();
  const p = toPointerInLayer(ev);
  const c = { x: centerX, y: centerY };
  beginInteraction({
    mode: "rotate",
    pointerId: ev.pointerId,
    startCenter: c,
    startPointerAngle: pointerAngle(p, c),
    startRotationRad: (rotationDeg * Math.PI) / 180,
  }, ev);
}

function beginResize(handle: ResizeHandle, ev: PointerEvent): void {
  if (isLineMode) return;
  if (ev.button !== 0) return;
  if (effectiveLockAspectRatio && isSideResizeHandle(handle)) return;
  ev.preventDefault();
  beginInteraction({
    mode: "resize",
    handle,
    pointerId: ev.pointerId,
    startPointer: toPointerInLayer(ev),
    startCenter: { x: centerX, y: centerY },
    startWidth: frameW,
    startHeight: frameH,
    startRotationRad: (rotationDeg * Math.PI) / 180,
    startFlipX: flipX,
    startFlipY: flipY,
  }, ev);
}

function beginLineStart(ev: PointerEvent): void {
  if (!isLineMode) return;
  if (ev.button !== 0) return;
  ev.preventDefault();
  beginInteraction({
    mode: "line-start",
    pointerId: ev.pointerId,
    fixedEnd: { x: lineEnd.x, y: lineEnd.y },
  }, ev);
}

function beginLineEnd(ev: PointerEvent): void {
  if (!isLineMode) return;
  if (ev.button !== 0) return;
  ev.preventDefault();
  beginInteraction({
    mode: "line-end",
    pointerId: ev.pointerId,
    fixedStart: { x: lineStart.x, y: lineStart.y },
  }, ev);
}

function doFlipX(ev: PointerEvent): void {
  if (ev.button !== 0) return;
  if (!canFlip) return;
  ev.preventDefault();
  flipX = !flipX;
  emitChange();
}

function doFlipY(ev: PointerEvent): void {
  if (ev.button !== 0) return;
  if (!canFlip) return;
  ev.preventDefault();
  flipY = !flipY;
  emitChange();
}

function clearSkews(ev: PointerEvent): void {
  if (ev.button !== 0) return;
  if (!canSkew) return;
  ev.preventDefault();
  skewXDeg = 0;
  skewYDeg = 0;
  emitChange();
}

function beginShearX(ev: PointerEvent): void {
  if (ev.button !== 0) return;
  if (!canSkew) return;
  ev.preventDefault();
  skewYDeg = 0;
  beginInteraction({
    mode: "shear-x",
    pointerId: ev.pointerId,
    startPointer: toPointerInLayer(ev),
    startSkewXDeg: skewXDeg,
    startFrameH: frameH,
    startRotationRad: (rotationDeg * Math.PI) / 180,
    startFlipX: flipX,
    startFlipY: flipY,
  }, ev);
}

function beginShearY(ev: PointerEvent): void {
  if (ev.button !== 0) return;
  if (!canSkew) return;
  ev.preventDefault();
  skewXDeg = 0;
  beginInteraction({
    mode: "shear-y",
    pointerId: ev.pointerId,
    startPointer: toPointerInLayer(ev),
    startSkewYDeg: skewYDeg,
    startFrameW: frameW,
    startRotationRad: (rotationDeg * Math.PI) / 180,
    startFlipX: flipX,
    startFlipY: flipY,
  }, ev);
}

function setLineFromEndpoints(nextStart: Point, nextEnd: Point): void {
  const dx = nextEnd.x - nextStart.x;
  const dy = nextEnd.y - nextStart.y;
  frameW = Math.max(MIN_LINE_LENGTH, Math.hypot(dx, dy));
  centerX = (nextStart.x + nextEnd.x) / 2;
  centerY = (nextStart.y + nextEnd.y) / 2;
  rotationDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
}

function updateInteraction(ev: PointerEvent): void {
  if (!interaction || ev.pointerId !== interaction.pointerId) return;

  const p = toPointerInLayer(ev);

  if (interaction.mode === "move") {
    const dx = p.x - interaction.startPointer.x;
    const dy = p.y - interaction.startPointer.y;
    centerX = interaction.startCenter.x + dx;
    centerY = interaction.startCenter.y + dy;
    emitChange();
    return;
  }

  if (interaction.mode === "line-start") {
    setLineFromEndpoints(p, interaction.fixedEnd);
    emitChange();
    return;
  }

  if (interaction.mode === "line-end") {
    setLineFromEndpoints(interaction.fixedStart, p);
    emitChange();
    return;
  }

  if (interaction.mode === "rotate") {
    const currentAngle = pointerAngle(p, interaction.startCenter);
    const nextRad = interaction.startRotationRad + (currentAngle - interaction.startPointerAngle);
    rotationDeg = (nextRad * 180) / Math.PI;
    emitChange();
    return;
  }

  if (interaction.mode === "shear-x") {
    const deltaScreen = { x: p.x - interaction.startPointer.x, y: p.y - interaction.startPointer.y };
    const deltaRotated = rotateVec(deltaScreen.x, deltaScreen.y, -interaction.startRotationRad);
    const deltaLocalX = deltaRotated.x * (interaction.startFlipX ? -1 : 1);
    const halfH = interaction.startFrameH / 2;
    const startOffsetX = halfH * Math.tan((interaction.startSkewXDeg * Math.PI) / 180);
    const newSkewXRad = Math.atan2(startOffsetX + deltaLocalX, halfH);
    skewXDeg = Math.max(-MAX_SKEW_DEG, Math.min(MAX_SKEW_DEG, (newSkewXRad * 180) / Math.PI));
    emitChange();
    return;
  }

  if (interaction.mode === "shear-y") {
    const deltaScreen = { x: p.x - interaction.startPointer.x, y: p.y - interaction.startPointer.y };
    const deltaRotated = rotateVec(deltaScreen.x, deltaScreen.y, -interaction.startRotationRad);
    const deltaLocalY = deltaRotated.y * (interaction.startFlipY ? -1 : 1);
    const halfW = interaction.startFrameW / 2;
    const startOffsetY = halfW * Math.tan((interaction.startSkewYDeg * Math.PI) / 180);
    const newSkewYRad = Math.atan2(startOffsetY + deltaLocalY, halfW);
    skewYDeg = Math.max(-MAX_SKEW_DEG, Math.min(MAX_SKEW_DEG, (newSkewYRad * 180) / Math.PI));
    emitChange();
    return;
  }

  const startC = interaction.startCenter;
  const deltaScreen = {
    x: p.x - interaction.startPointer.x,
    y: p.y - interaction.startPointer.y,
  };
  const deltaRotated = rotateVec(deltaScreen.x, deltaScreen.y, -interaction.startRotationRad);
  const deltaLocal = {
    x: deltaRotated.x,
    y: deltaRotated.y,
  };

  if (effectiveLockAspectRatio && !isSideResizeHandle(interaction.handle)) {
    const ratio = interaction.startWidth / interaction.startHeight;
    const widthDelta = interaction.handle === "e" || interaction.handle === "ne" || interaction.handle === "se" ? deltaLocal.x : -deltaLocal.x;
    const heightDelta = interaction.handle === "s" || interaction.handle === "se" || interaction.handle === "sw" ? deltaLocal.y : -deltaLocal.y;

    let nextWidth: number;
    let nextHeight: number;
    if (Math.abs(widthDelta / interaction.startWidth) >= Math.abs(heightDelta / interaction.startHeight)) {
      nextWidth = Math.max(MIN_WIDTH, interaction.startWidth + widthDelta);
      nextHeight = Math.max(MIN_HEIGHT, nextWidth / ratio);
      nextWidth = nextHeight * ratio;
    } else {
      nextHeight = Math.max(MIN_HEIGHT, interaction.startHeight + heightDelta);
      nextWidth = Math.max(MIN_WIDTH, nextHeight * ratio);
      nextHeight = nextWidth / ratio;
    }

    let minX = -interaction.startWidth / 2;
    let maxX = interaction.startWidth / 2;
    let minY = -interaction.startHeight / 2;
    let maxY = interaction.startHeight / 2;

    const { affectsRight, affectsLeft, affectsTop, affectsBottom } = getHandleAffects(interaction.handle);

    if (affectsRight) maxX = minX + nextWidth;
    if (affectsLeft) minX = maxX - nextWidth;
    if (affectsBottom) maxY = minY + nextHeight;
    if (affectsTop) minY = maxY - nextHeight;

    const nextLocalCenter = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
    const centerShiftScreen = rotateVec(nextLocalCenter.x, nextLocalCenter.y, interaction.startRotationRad);

    centerX = startC.x + centerShiftScreen.x;
    centerY = startC.y + centerShiftScreen.y;
    frameW = Math.max(MIN_WIDTH, maxX - minX);
    frameH = Math.max(MIN_HEIGHT, maxY - minY);

    emitChange();
    return;
  }

  let minX = -interaction.startWidth / 2;
  let maxX = interaction.startWidth / 2;
  let minY = -interaction.startHeight / 2;
  let maxY = interaction.startHeight / 2;

  const { affectsRight, affectsLeft, affectsTop, affectsBottom } = getHandleAffects(interaction.handle);

  if (affectsRight) {
    maxX = Math.max(maxX + deltaLocal.x, minX + MIN_WIDTH);
  }
  if (affectsLeft) {
    minX = Math.min(minX + deltaLocal.x, maxX - MIN_WIDTH);
  }
  if (affectsBottom) {
    maxY = Math.max(maxY + deltaLocal.y, minY + MIN_HEIGHT);
  }
  if (affectsTop) {
    minY = Math.min(minY + deltaLocal.y, maxY - MIN_HEIGHT);
  }

  const nextLocalCenter = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
  const centerShiftScreen = rotateVec(nextLocalCenter.x, nextLocalCenter.y, interaction.startRotationRad);

  centerX = startC.x + centerShiftScreen.x;
  centerY = startC.y + centerShiftScreen.y;
  frameW = Math.max(MIN_WIDTH, maxX - minX);
  frameH = Math.max(MIN_HEIGHT, maxY - minY);

  emitChange();
}

function endInteraction(ev: PointerEvent): void {
  if (!interaction || ev.pointerId !== interaction.pointerId) return;
  releaseCapturedPointer(interaction.pointerId);
  setInteraction(null);
}

function endInteractionOnLeave(_ev: PointerEvent): void {
  if (!interaction) return;
  if (capturedPointer?.pointerId === interaction.pointerId) return;
  releaseCapturedPointer(interaction.pointerId);
  setInteraction(null);
}

function beginCapturedMove(pointer: { pointerId: number; clientX: number; clientY: number }): void {
  if (!layerEl) return;
  const startPointer = toLayerPoint(pointer.clientX, pointer.clientY);
  setInteraction({
    mode: "move",
    pointerId: pointer.pointerId,
    startPointer,
    startCenter: { x: centerX, y: centerY },
  });
  capturePointerById(pointer.pointerId);
}

onMount(() => {
  if (isLineMode) {
    frameW = Math.max(MIN_LINE_LENGTH, initial.width);
    frameH = 0;
    centerX = initial.x;
    centerY = initial.y;
  } else {
    centerX = initial.x;
    centerY = initial.y;
    frameW = initial.width;
    frameH = initial.height;
  }

  rotationDeg = initial.rotationDeg;
  flipX = false;
  flipY = false;
  skewXDeg = 0;
  skewYDeg = 0;

  if (activePointer) {
    beginCapturedMove(activePointer);
  }

  layerEl.addEventListener("pointermove", updateInteraction as EventListener);
  layerEl.addEventListener("pointerup", endInteraction as EventListener);
  layerEl.addEventListener("pointercancel", endInteraction as EventListener);
  layerEl.addEventListener("pointerleave", endInteractionOnLeave as EventListener);
});

onDestroy(() => {
  layerEl.removeEventListener("pointermove", updateInteraction as EventListener);
  layerEl.removeEventListener("pointerup", endInteraction as EventListener);
  layerEl.removeEventListener("pointercancel", endInteraction as EventListener);
  layerEl.removeEventListener("pointerleave", endInteractionOnLeave as EventListener);

  if (capturedPointer) {
    releaseCapturedPointer(capturedPointer.pointerId);
  }

  if (interaction) {
    onInteractionChange?.(false);
  }
});
</script>

<svg
  class="te-layer"
  bind:this={layerEl}
  width={viewport.width}
  height={viewport.height}
  viewBox={`0 0 ${viewport.width} ${viewport.height}`}
  preserveAspectRatio="none"
  style={`--te-color: ${effectiveStrokeColor};`}
>
  {#if isLineMode}
    <line
      class="te-hitline"
      x1={lineStart.x}
      y1={lineStart.y}
      x2={lineEnd.x}
      y2={lineEnd.y}
      role="button"
      tabindex="-1"
      aria-label="Move line"
      onpointerdown={beginMove}
    />
    <line class="te-line" x1={lineStart.x} y1={lineStart.y} x2={lineEnd.x} y2={lineEnd.y} />
    <line class="te-arm" x1={centerX} y1={centerY} x2={lineRotateHandle.x} y2={lineRotateHandle.y} />

    <circle
      class="te-handle te-start"
      cx={lineStart.x}
      cy={lineStart.y}
      r="8"
      role="button"
      tabindex="-1"
      aria-label="Move line start"
      onpointerdown={beginLineStart}
    />

    <circle
      class="te-handle te-end"
      cx={lineEnd.x}
      cy={lineEnd.y}
      r="8"
      role="button"
      tabindex="-1"
      aria-label="Move line end"
      onpointerdown={beginLineEnd}
    />

    <circle
      class="te-handle te-rotate-dot"
      cx={lineRotateHandle.x}
      cy={lineRotateHandle.y}
      r="7"
      role="button"
      tabindex="-1"
      aria-label="Rotate line"
      onpointerdown={beginRotate}
    />
  {:else}
    <g transform={`translate(${centerX} ${centerY}) rotate(${rotationDeg}) scale(${flipX ? -1 : 1} ${flipY ? -1 : 1}) skewX(${skewXDeg}) skewY(${skewYDeg})`}>
      <rect class="te-content-quad" x={-frameW / 2} y={-frameH / 2} width={frameW} height={frameH} />
    </g>

    <g transform={`translate(${centerX} ${centerY}) rotate(${rotationDeg})`}>
      <g class="te-center-mark" aria-hidden="true">
        <line x1="-8" y1="0" x2="8" y2="0" />
        <line x1="0" y1="-8" x2="0" y2="8" />
        <circle cx="0" cy="0" r="3.5" />
      </g>

      <rect class="te-base-box" x={baseBounds.x} y={baseBounds.y} width={baseBounds.w} height={baseBounds.h} aria-hidden="true" />

      <rect
        class="te-box"
        x={contentBounds.x}
        y={contentBounds.y}
        width={contentBounds.w}
        height={contentBounds.h}
        role="button"
        tabindex="-1"
        aria-label="Move transform frame"
        onpointerdown={beginMove}
      />

      <line class="te-rotate-arm" x1="0" y1={-frameH / 2} x2="0" y2={-frameH / 2 - 26} />
      <circle
        class="te-rotate-handle"
        cx="0"
        cy={-frameH / 2 - 34}
        r="7"
        role="button"
        tabindex="-1"
        aria-label="Rotate transform frame"
        onpointerdown={beginRotate}
      />

      {#if canSideResize}
        <rect class="te-handle" x={-7} y={-frameH / 2 - 7} width="14" height="14" role="button" tabindex="-1" aria-label="Resize north" onpointerdown={(ev) => beginResize("n", ev)} />
        <rect class="te-handle" x={-7} y={frameH / 2 - 7} width="14" height="14" role="button" tabindex="-1" aria-label="Resize south" onpointerdown={(ev) => beginResize("s", ev)} />
        <rect class="te-handle" x={frameW / 2 - 7} y={-7} width="14" height="14" role="button" tabindex="-1" aria-label="Resize east" onpointerdown={(ev) => beginResize("e", ev)} />
        <rect class="te-handle" x={-frameW / 2 - 7} y={-7} width="14" height="14" role="button" tabindex="-1" aria-label="Resize west" onpointerdown={(ev) => beginResize("w", ev)} />
      {/if}

      <rect class="te-handle te-corner" x={-frameW / 2 - 8} y={-frameH / 2 - 8} width="16" height="16" role="button" tabindex="-1" aria-label="Resize north-west" onpointerdown={(ev) => beginResize("nw", ev)} />
      <rect class="te-handle te-corner" x={frameW / 2 - 8} y={-frameH / 2 - 8} width="16" height="16" role="button" tabindex="-1" aria-label="Resize north-east" onpointerdown={(ev) => beginResize("ne", ev)} />
      <rect class="te-handle te-corner" x={frameW / 2 - 8} y={frameH / 2 - 8} width="16" height="16" role="button" tabindex="-1" aria-label="Resize south-east" onpointerdown={(ev) => beginResize("se", ev)} />
      <rect class="te-handle te-corner" x={-frameW / 2 - 8} y={frameH / 2 - 8} width="16" height="16" role="button" tabindex="-1" aria-label="Resize south-west" onpointerdown={(ev) => beginResize("sw", ev)} />

      {#if canSkew}
        <line class="te-extra-arm" x1="0" y1={frameH / 2} x2="0" y2={frameH / 2 + 24} />
        <line class="te-extra-arm" x1={frameW / 4} y1={frameH / 2} x2={frameW / 4} y2={frameH / 2 + 24} />
        <line class="te-extra-arm" x1={frameW / 2} y1="0" x2={frameW / 2 + 24} y2="0" />
        <line class="te-extra-arm" x1={frameW / 2} y1={frameH / 4} x2={frameW / 2 + 24} y2={frameH / 4} />
        <line class="te-extra-arm" x1={-frameW / 2} y1="0" x2={-frameW / 2 - 24} y2="0" />
      {/if}

      {#if canFlip}
        <circle class="te-flip-handle" cx="0" cy={frameH / 2 + 34} r="9" role="button" tabindex="-1" aria-label="Flip horizontally" onpointerdown={doFlipX} />
        <text class="te-handle-icon" x="0" y={frameH / 2 + 34} text-anchor="middle" dominant-baseline="central" pointer-events="none">⛓</text>

        <circle class="te-flip-handle" cx={frameW / 2 + 34} cy="0" r="9" role="button" tabindex="-1" aria-label="Flip vertically" onpointerdown={doFlipY} />
        <text class="te-handle-icon" x={frameW / 2 + 34} y="0" text-anchor="middle" dominant-baseline="central" pointer-events="none">⛓</text>
      {/if}

      {#if canSkew}
        <circle class="te-clear-handle" cx={-frameW / 2 - 34} cy="0" r="9" role="button" tabindex="-1" aria-label="Clear skew" onpointerdown={clearSkews} />
        <text class="te-handle-icon te-clear-icon" x={-frameW / 2 - 34} y="0" text-anchor="middle" dominant-baseline="central" pointer-events="none">×</text>

        <rect
          class="te-shear-handle"
          x={-8} y={-8} width="16" height="16"
          transform={`translate(${frameW / 4} ${frameH / 2 + 34}) rotate(45)`}
          role="button" tabindex="-1" aria-label="Shear X"
          onpointerdown={beginShearX}
        />

        <rect
          class="te-shear-handle"
          x={-8} y={-8} width="16" height="16"
          transform={`translate(${frameW / 2 + 34} ${frameH / 4}) rotate(45)`}
          role="button" tabindex="-1" aria-label="Shear Y"
          onpointerdown={beginShearY}
        />
      {/if}
    </g>
  {/if}
</svg>

<style>
.te-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 4;
}

.te-content-quad {
  fill: transparent;
  stroke: var(--te-color);
  stroke-width: 2.2;
  pointer-events: none;
}

.te-base-box {
  fill: transparent;
  stroke: var(--te-color);
  stroke-width: 1.1;
  stroke-dasharray: 2.5 5;
  stroke-opacity: 0.4;
  pointer-events: none;
}

.te-box {
  fill: transparent;
  stroke: var(--te-color);
  stroke-width: 1.2;
  stroke-dasharray: 5 4;
  stroke-opacity: 0.55;
  pointer-events: all;
  cursor: move;
}

.te-center-mark {
  pointer-events: none;
}

.te-center-mark line {
  stroke: rgba(124, 58, 237, 0.9);
  stroke-width: 1.6;
  stroke-linecap: round;
}

.te-center-mark circle {
  fill: #ffffff;
  stroke: rgba(124, 58, 237, 0.95);
  stroke-width: 1.4;
}

.te-rotate-arm {
  stroke: var(--te-color);
  stroke-width: 2;
}

.te-handle {
  fill: #ffffff;
  stroke: var(--te-color);
  stroke-width: 1.7;
  rx: 2;
  pointer-events: all;
  cursor: grab;
}

.te-corner {
  rx: 2;
}

.te-rotate-handle,
.te-rotate-dot {
  fill: #ffffff;
  stroke: var(--te-color);
  stroke-width: 2;
  pointer-events: all;
  cursor: grab;
}

.te-extra-arm,
.te-arm {
  stroke: color-mix(in srgb, var(--te-color), #fff 35%);
  stroke-width: 1.5;
  stroke-dasharray: 4 3;
  pointer-events: none;
}

.te-flip-handle {
  fill: #0d9488;
  stroke: #ffffff;
  stroke-width: 1.5;
  pointer-events: all;
  cursor: pointer;
}

.te-clear-handle {
  fill: #f59e0b;
  stroke: #ffffff;
  stroke-width: 1.5;
  pointer-events: all;
  cursor: pointer;
}

.te-handle-icon {
  font-size: 10px;
  fill: #ffffff;
  font-family: sans-serif;
  user-select: none;
}

.te-clear-icon {
  font-size: 12px;
  font-weight: 700;
}

.te-shear-handle {
  fill: #d97706;
  stroke: #ffffff;
  stroke-width: 1.5;
  pointer-events: all;
  cursor: grab;
}

.te-hitline {
  stroke: transparent;
  stroke-width: 20;
  stroke-linecap: round;
  pointer-events: all;
  cursor: move;
}

.te-line {
  stroke: var(--te-color);
  stroke-width: 3;
  stroke-linecap: round;
  pointer-events: none;
}

.te-start,
.te-end {
  cursor: grab;
}
</style>
