<script module lang="ts">
const MIN_WIDTH = 36;
const MIN_HEIGHT = 36;
const STROKE_COLOR = "#7c3aed";
</script>

<script lang="ts">
import { onDestroy, onMount } from "svelte";

import type { IDimension, Point, RotatedRect } from "./types";

export type TransformFrameState = {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  rotationDeg: number;
  flipX: boolean;
  flipY: boolean;
  skewXDeg: number;
  skewYDeg: number;
};

type ResizeHandle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
type Interaction =
  | {
      mode: "move";
      pointerId: number;
      startPointer: Point;
      startCenter: Point;
      target: Element;
    }
  | {
      mode: "rotate";
      pointerId: number;
      startCenter: Point;
      startPointerAngle: number;
      startRotationRad: number;
      target: Element;
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
      target: Element;
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
      target: Element;
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
      target: Element;
    };

type Props = {
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
  onchange?: (state: TransformFrameState) => void;
};

const {
  initial = { x: 220, y: 145, width: 240, height: 150, rotationDeg: -10 },
  viewport,
  activePointer = null,
  lockAspectRatio = false,
  disableFlip = false,
  disableSkew = false,
  onchange,
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

let interaction = $state<Interaction | null>(null);

const rotationRad = $derived((rotationDeg * Math.PI) / 180);
const MAX_SKEW_DEG = 60;
const canFlip = $derived(!lockAspectRatio && !disableFlip);
const canSkew = $derived(!lockAspectRatio && !disableSkew);
const canSideResize = $derived(!lockAspectRatio);

// AABB of the content quad after scale(flip) + skewX + skewY, in rotate-local space.
// Flip (scale ±1) on a centered rect doesn't change the AABB, so only skew matters.
const contentBounds = $derived.by(() => {
  const tanX = Math.tan((skewXDeg * Math.PI) / 180);
  const tanY = Math.tan((skewYDeg * Math.PI) / 180);
  const w = frameW;
  const h = frameH;

  const corners: [number, number][] = [
    [-w / 2, -h / 2],
    [ w / 2, -h / 2],
    [ w / 2,  h / 2],
    [-w / 2,  h / 2],
  ].map(([x, y]) => {
    const sx = x + y * tanX;      // skewX: x displaced by y
    return [sx, y + sx * tanY];   // skewY: y displaced by already-sheared x
  });

  const xs = corners.map(([x]) => x);
  const ys = corners.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
});

// The original unskewed rect stays visible so the handle rails remain visually attached
// even when the content quad becomes a sheared parallelogram.
const baseBounds = $derived.by(() => ({
  x: -frameW / 2,
  y: -frameH / 2,
  w: frameW,
  h: frameH,
}));

function isSideResizeHandle(handle: ResizeHandle): boolean {
  return handle === "n" || handle === "s" || handle === "e" || handle === "w";
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
  onchange?.({
    centerX,
    centerY,
    width: frameW,
    height: frameH,
    rotationDeg,
    flipX,
    flipY,
    skewXDeg,
    skewYDeg,
  });
}

function beginMove(ev: PointerEvent): void {
  if (ev.button !== 0) return;
  ev.preventDefault();
  const target = ev.currentTarget as Element;
  target.setPointerCapture(ev.pointerId);
  interaction = {
    mode: "move",
    pointerId: ev.pointerId,
    startPointer: toPointerInLayer(ev),
    startCenter: { x: centerX, y: centerY },
    target,
  };
}

function beginRotate(ev: PointerEvent): void {
  if (ev.button !== 0) return;
  ev.preventDefault();
  const target = ev.currentTarget as Element;
  target.setPointerCapture(ev.pointerId);
  const p = toPointerInLayer(ev);
  const c = { x: centerX, y: centerY };
  interaction = {
    mode: "rotate",
    pointerId: ev.pointerId,
    startCenter: c,
    startPointerAngle: pointerAngle(p, c),
    startRotationRad: (rotationDeg * Math.PI) / 180,
    target,
  };
}

function beginResize(handle: ResizeHandle, ev: PointerEvent): void {
  if (ev.button !== 0) return;
  if (lockAspectRatio && isSideResizeHandle(handle)) return;
  ev.preventDefault();
  const target = ev.currentTarget as Element;
  target.setPointerCapture(ev.pointerId);
  interaction = {
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
    target,
  };
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
  const target = ev.currentTarget as Element;
  target.setPointerCapture(ev.pointerId);
  interaction = {
    mode: "shear-x",
    pointerId: ev.pointerId,
    startPointer: toPointerInLayer(ev),
    startSkewXDeg: skewXDeg,
    startFrameH: frameH,
    startRotationRad: (rotationDeg * Math.PI) / 180,
    startFlipX: flipX,
    startFlipY: flipY,
    target,
  };
}

function beginShearY(ev: PointerEvent): void {
  if (ev.button !== 0) return;
  if (!canSkew) return;
  ev.preventDefault();
  skewXDeg = 0;
  const target = ev.currentTarget as Element;
  target.setPointerCapture(ev.pointerId);
  interaction = {
    mode: "shear-y",
    pointerId: ev.pointerId,
    startPointer: toPointerInLayer(ev),
    startSkewYDeg: skewYDeg,
    startFrameW: frameW,
    startRotationRad: (rotationDeg * Math.PI) / 180,
    startFlipX: flipX,
    startFlipY: flipY,
    target,
  };
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
  // Resize handles live on the unflipped frame, so drag direction should follow
  // the rotate-local axes directly (independent of content flip state).
  const deltaLocal = {
    x: deltaRotated.x,
    y: deltaRotated.y,
  };

  // Locked aspect ratio keeps corners usable while suppressing side stretch.
  // We resolve the final size from the dominant local axis and then rebuild the
  // rectangle from the anchored edges so the rotation-center math stays unchanged.
  if (lockAspectRatio && !isSideResizeHandle(interaction.handle)) {
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

    const affectsRight = interaction.handle === "e" || interaction.handle === "ne" || interaction.handle === "se";
    const affectsLeft = interaction.handle === "w" || interaction.handle === "nw" || interaction.handle === "sw";
    const affectsTop = interaction.handle === "n" || interaction.handle === "ne" || interaction.handle === "nw";
    const affectsBottom = interaction.handle === "s" || interaction.handle === "se" || interaction.handle === "sw";

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

  const affectsRight = interaction.handle === "e" || interaction.handle === "ne" || interaction.handle === "se";
  const affectsLeft = interaction.handle === "w" || interaction.handle === "nw" || interaction.handle === "sw";
  const affectsTop = interaction.handle === "n" || interaction.handle === "ne" || interaction.handle === "nw";
  const affectsBottom = interaction.handle === "s" || interaction.handle === "se" || interaction.handle === "sw";

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
  if (interaction.target.hasPointerCapture(ev.pointerId)) {
    interaction.target.releasePointerCapture(ev.pointerId);
  }
  interaction = null;
}

function beginCapturedMove(pointer: { pointerId: number; clientX: number; clientY: number }): void {
  if (!layerEl) return;
  const startPointer = toLayerPoint(pointer.clientX, pointer.clientY);
  layerEl.setPointerCapture(pointer.pointerId);
  interaction = {
    mode: "move",
    pointerId: pointer.pointerId,
    startPointer,
    startCenter: { x: centerX, y: centerY },
    target: layerEl,
  };
}

onMount(() => {
  centerX = initial.x + initial.width / 2;
  centerY = initial.y + initial.height / 2;
  frameW = initial.width;
  frameH = initial.height;
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
});

onDestroy(() => {
  layerEl.removeEventListener("pointermove", updateInteraction as EventListener);
  layerEl.removeEventListener("pointerup", endInteraction as EventListener);
  layerEl.removeEventListener("pointercancel", endInteraction as EventListener);

  if (interaction?.target.hasPointerCapture(interaction.pointerId)) {
    interaction.target.releasePointerCapture(interaction.pointerId);
  }
});
</script>

<svg class="tf-layer" bind:this={layerEl} width={viewport.width} height={viewport.height} viewBox={`0 0 ${viewport.width} ${viewport.height}`} preserveAspectRatio="none" style={`--tf-color: ${STROKE_COLOR};`}>
    <!-- Content layer: visual quad — affected by flip and shear -->
    <g transform={`translate(${centerX} ${centerY}) rotate(${rotationDeg}) scale(${flipX ? -1 : 1} ${flipY ? -1 : 1}) skewX(${skewXDeg}) skewY(${skewYDeg})`}>
      <rect class="tf-content-quad" x={-frameW / 2} y={-frameH / 2} width={frameW} height={frameH} />
    </g>

    <!-- Handles layer: rectangular selection frame — only translate + rotate, no flip/shear -->
    <g transform={`translate(${centerX} ${centerY}) rotate(${rotationDeg})`}>
      <g class="tf-center-mark" aria-hidden="true">
        <line x1="-8" y1="0" x2="8" y2="0" />
        <line x1="0" y1="-8" x2="0" y2="8" />
        <circle cx="0" cy="0" r="3.5" />
      </g>

      <rect
        class="tf-base-box"
        x={baseBounds.x}
        y={baseBounds.y}
        width={baseBounds.w}
        height={baseBounds.h}
        aria-hidden="true"
      />

      <rect
        class="tf-box"
        x={contentBounds.x}
        y={contentBounds.y}
        width={contentBounds.w}
        height={contentBounds.h}
        role="button"
        tabindex="-1"
        aria-label="Move transform frame"
        onpointerdown={beginMove}
        onpointermove={updateInteraction}
        onpointerup={endInteraction}
        onpointercancel={endInteraction}
      />

      <line class="tf-rotate-arm" x1="0" y1={-frameH / 2} x2="0" y2={-frameH / 2 - 26} />
      <circle
        class="tf-handle tf-rotate"
        cx="0"
        cy={-frameH / 2 - 34}
        r="7"
        role="button"
        tabindex="-1"
        aria-label="Rotate transform frame"
        onpointerdown={beginRotate}
        onpointermove={updateInteraction}
        onpointerup={endInteraction}
        onpointercancel={endInteraction}
      />

      {#if canSideResize}
        <rect class="tf-handle" x={-7} y={-frameH / 2 - 7} width="14" height="14" role="button" tabindex="-1" aria-label="Resize north" onpointerdown={(ev) => beginResize("n", ev)} onpointermove={updateInteraction} onpointerup={endInteraction} onpointercancel={endInteraction} />
        <rect class="tf-handle" x={-7} y={frameH / 2 - 7} width="14" height="14" role="button" tabindex="-1" aria-label="Resize south" onpointerdown={(ev) => beginResize("s", ev)} onpointermove={updateInteraction} onpointerup={endInteraction} onpointercancel={endInteraction} />
        <rect class="tf-handle" x={frameW / 2 - 7} y={-7} width="14" height="14" role="button" tabindex="-1" aria-label="Resize east" onpointerdown={(ev) => beginResize("e", ev)} onpointermove={updateInteraction} onpointerup={endInteraction} onpointercancel={endInteraction} />
        <rect class="tf-handle" x={-frameW / 2 - 7} y={-7} width="14" height="14" role="button" tabindex="-1" aria-label="Resize west" onpointerdown={(ev) => beginResize("w", ev)} onpointermove={updateInteraction} onpointerup={endInteraction} onpointercancel={endInteraction} />
      {/if}

      <rect class="tf-handle tf-corner" x={-frameW / 2 - 8} y={-frameH / 2 - 8} width="16" height="16" role="button" tabindex="-1" aria-label="Resize north-west" onpointerdown={(ev) => beginResize("nw", ev)} onpointermove={updateInteraction} onpointerup={endInteraction} onpointercancel={endInteraction} />
      <rect class="tf-handle tf-corner" x={frameW / 2 - 8} y={-frameH / 2 - 8} width="16" height="16" role="button" tabindex="-1" aria-label="Resize north-east" onpointerdown={(ev) => beginResize("ne", ev)} onpointermove={updateInteraction} onpointerup={endInteraction} onpointercancel={endInteraction} />
      <rect class="tf-handle tf-corner" x={frameW / 2 - 8} y={frameH / 2 - 8} width="16" height="16" role="button" tabindex="-1" aria-label="Resize south-east" onpointerdown={(ev) => beginResize("se", ev)} onpointermove={updateInteraction} onpointerup={endInteraction} onpointercancel={endInteraction} />
      <rect class="tf-handle tf-corner" x={-frameW / 2 - 8} y={frameH / 2 - 8} width="16" height="16" role="button" tabindex="-1" aria-label="Resize south-west" onpointerdown={(ev) => beginResize("sw", ev)} onpointermove={updateInteraction} onpointerup={endInteraction} onpointercancel={endInteraction} />

      <!-- Arms for extra handles -->
      {#if canSkew}
        <line class="tf-extra-arm" x1="0" y1={frameH / 2} x2="0" y2={frameH / 2 + 24} />
        <line class="tf-extra-arm" x1={frameW / 4} y1={frameH / 2} x2={frameW / 4} y2={frameH / 2 + 24} />
        <line class="tf-extra-arm" x1={frameW / 2} y1="0" x2={frameW / 2 + 24} y2="0" />
        <line class="tf-extra-arm" x1={frameW / 2} y1={frameH / 4} x2={frameW / 2 + 24} y2={frameH / 4} />
        <line class="tf-extra-arm" x1={-frameW / 2} y1="0" x2={-frameW / 2 - 24} y2="0" />
      {/if}

      {#if canFlip}
        <!-- Flip-X handle: south middle, click-only -->
        <circle class="tf-flip-handle" cx="0" cy={frameH / 2 + 34} r="9" role="button" tabindex="-1" aria-label="Flip horizontally" onpointerdown={doFlipX} />
        <text class="tf-handle-icon" x="0" y={frameH / 2 + 34} text-anchor="middle" dominant-baseline="central" pointer-events="none">⛓</text>

        <!-- Flip-Y handle: east middle, click-only -->
        <circle class="tf-flip-handle" cx={frameW / 2 + 34} cy="0" r="9" role="button" tabindex="-1" aria-label="Flip vertically" onpointerdown={doFlipY} />
        <text class="tf-handle-icon" x={frameW / 2 + 34} y="0" text-anchor="middle" dominant-baseline="central" pointer-events="none">⛓</text>
      {/if}

      {#if canSkew}
        <!-- Clear-skew handle: west middle, click-only -->
        <circle class="tf-clear-handle" cx={-frameW / 2 - 34} cy="0" r="9" role="button" tabindex="-1" aria-label="Clear skew" onpointerdown={clearSkews} />
        <text class="tf-handle-icon tf-clear-icon" x={-frameW / 2 - 34} y="0" text-anchor="middle" dominant-baseline="central" pointer-events="none">×</text>

        <!-- Shear-X handle: south, right-offset, draggable diamond -->
        <rect
          class="tf-shear-handle tf-shear-x"
          x={-8} y={-8} width="16" height="16"
          transform={`translate(${frameW / 4} ${frameH / 2 + 34}) rotate(45)`}
          role="button" tabindex="-1" aria-label="Shear X"
          onpointerdown={beginShearX}
          onpointermove={updateInteraction}
          onpointerup={endInteraction}
          onpointercancel={endInteraction}
        />

        <!-- Shear-Y handle: east, bottom-offset, draggable diamond -->
        <rect
          class="tf-shear-handle tf-shear-y"
          x={-8} y={-8} width="16" height="16"
          transform={`translate(${frameW / 2 + 34} ${frameH / 4}) rotate(45)`}
          role="button" tabindex="-1" aria-label="Shear Y"
          onpointerdown={beginShearY}
          onpointermove={updateInteraction}
          onpointerup={endInteraction}
          onpointercancel={endInteraction}
        />
      {/if}
    </g>
</svg>

<style>
.tf-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 4;
}

.tf-content-quad {
  fill: transparent;
  stroke: var(--tf-color);
  stroke-width: 2.2;
  pointer-events: none;
}

.tf-base-box {
  fill: transparent;
  stroke: var(--tf-color);
  stroke-width: 1.1;
  stroke-dasharray: 2.5 5;
  stroke-opacity: 0.4;
  pointer-events: none;
}

.tf-box {
  fill: transparent;
  stroke: var(--tf-color);
  stroke-width: 1.2;
  stroke-dasharray: 5 4;
  stroke-opacity: 0.55;
  pointer-events: all;
  cursor: move;
}

.tf-center-mark {
  pointer-events: none;
}

.tf-center-mark line {
  stroke: rgba(124, 58, 237, 0.9);
  stroke-width: 1.6;
  stroke-linecap: round;
}

.tf-center-mark circle {
  fill: #ffffff;
  stroke: rgba(124, 58, 237, 0.95);
  stroke-width: 1.4;
}

.tf-rotate-arm {
  stroke: var(--tf-color);
  stroke-width: 2;
}

.tf-handle {
  fill: #ffffff;
  stroke: var(--tf-color);
  stroke-width: 1.7;
  rx: 2;
  pointer-events: all;
  cursor: grab;
}

.tf-corner {
  rx: 2;
}

.tf-rotate {
  fill: #ffffff;
  stroke: var(--tf-color);
  stroke-width: 2;
  pointer-events: all;
  cursor: grab;
}

.tf-extra-arm {
  stroke: rgba(120, 80, 200, 0.45);
  stroke-width: 1.5;
  stroke-dasharray: 3 3;
}

.tf-flip-handle {
  fill: #0d9488;
  stroke: #ffffff;
  stroke-width: 1.5;
  pointer-events: all;
  cursor: pointer;
}

.tf-clear-handle {
  fill: #f59e0b;
  stroke: #ffffff;
  stroke-width: 1.5;
  pointer-events: all;
  cursor: pointer;
}

.tf-handle-icon {
  font-size: 10px;
  fill: #ffffff;
  font-family: sans-serif;
  user-select: none;
}

.tf-clear-icon {
  font-size: 12px;
  font-weight: 700;
}

.tf-shear-handle {
  fill: #d97706;
  stroke: #ffffff;
  stroke-width: 1.5;
  pointer-events: all;
  cursor: grab;
}

.tf-shear-x {
  cursor: grab;
}

.tf-shear-y {
  cursor: grab;
}
</style>
