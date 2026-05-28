<script module lang="ts">
const MIN_LINE_LENGTH = 1;
const STROKE_COLOR = "#0f766e";
</script>

<script lang="ts">
import { onDestroy, onMount } from "svelte";

import type { IDimension, Point, RotatedRect } from "./types";

type Interaction =
  | {
      mode: "move";
      pointerId: number;
      startPointer: Point;
      startCenter: Point;
      target: Element;
    }
  | {
      mode: "start";
      pointerId: number;
      fixedEnd: Point;
      target: Element;
    }
  | {
      mode: "end";
      pointerId: number;
      fixedStart: Point;
      target: Element;
    }
  | {
      mode: "rotate";
      pointerId: number;
      startCenter: Point;
      startPointerAngle: number;
      startRotationRad: number;
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
  strokeColor?: string;
  onchange?: (next: RotatedRect) => void;
};

const {
  initial = { x: 200, y: 180, width: 220, height: 0, rotationDeg: 18 },
  viewport,
  activePointer = null,
  strokeColor = STROKE_COLOR,
  onchange,
}: Props = $props();

let layerEl: SVGSVGElement;

let centerX = $state(310);
let centerY = $state(220);
let lineLength = $state(220);
let rotationDeg = $state(0);
let interaction = $state<Interaction | null>(null);

const rotationRad = $derived((rotationDeg * Math.PI) / 180);
const dir = $derived({ x: Math.cos(rotationRad), y: Math.sin(rotationRad) });
const start = $derived({ x: centerX - (dir.x * lineLength) / 2, y: centerY - (dir.y * lineLength) / 2 });
const end = $derived({ x: centerX + (dir.x * lineLength) / 2, y: centerY + (dir.y * lineLength) / 2 });
const perp = $derived({ x: -dir.y, y: dir.x });
const rotateHandle = $derived({ x: centerX + perp.x * 34, y: centerY + perp.y * 34 });

function toLayerPoint(clientX: number, clientY: number): Point {
  const rect = layerEl.getBoundingClientRect();
  return { x: clientX - rect.left, y: clientY - rect.top };
}

function toPointerInLayer(ev: PointerEvent): Point {
  return toLayerPoint(ev.clientX, ev.clientY);
}

function pointerAngle(pointer: Point, c: Point): number {
  return Math.atan2(pointer.y - c.y, pointer.x - c.x);
}

function emitChange(): void {
  onchange?.({
    x: centerX,
    y: centerY,
    width: lineLength,
    height: 0,
    rotationDeg,
  });
}

function setFromEndpoints(nextStart: Point, nextEnd: Point): void {
  const dx = nextEnd.x - nextStart.x;
  const dy = nextEnd.y - nextStart.y;
  const len = Math.max(MIN_LINE_LENGTH, Math.hypot(dx, dy));

  centerX = (nextStart.x + nextEnd.x) / 2;
  centerY = (nextStart.y + nextEnd.y) / 2;
  lineLength = len;
  rotationDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
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

function beginStart(ev: PointerEvent): void {
  if (ev.button !== 0) return;
  ev.preventDefault();
  const target = ev.currentTarget as Element;
  target.setPointerCapture(ev.pointerId);
  interaction = {
    mode: "start",
    pointerId: ev.pointerId,
    fixedEnd: { x: end.x, y: end.y },
    target,
  };
}

function beginEnd(ev: PointerEvent): void {
  if (ev.button !== 0) return;
  ev.preventDefault();
  const target = ev.currentTarget as Element;
  target.setPointerCapture(ev.pointerId);
  interaction = {
    mode: "end",
    pointerId: ev.pointerId,
    fixedStart: { x: start.x, y: start.y },
    target,
  };
}

function beginRotate(ev: PointerEvent): void {
  if (ev.button !== 0) return;
  ev.preventDefault();
  const target = ev.currentTarget as Element;
  target.setPointerCapture(ev.pointerId);
  const pointer = toPointerInLayer(ev);
  const c = { x: centerX, y: centerY };
  interaction = {
    mode: "rotate",
    pointerId: ev.pointerId,
    startCenter: c,
    startPointerAngle: pointerAngle(pointer, c),
    startRotationRad: (rotationDeg * Math.PI) / 180,
    target,
  };
}

function updateInteraction(ev: PointerEvent): void {
  if (!interaction || ev.pointerId !== interaction.pointerId) return;

  const pointer = toPointerInLayer(ev);

  if (interaction.mode === "move") {
    const dx = pointer.x - interaction.startPointer.x;
    const dy = pointer.y - interaction.startPointer.y;
    centerX = interaction.startCenter.x + dx;
    centerY = interaction.startCenter.y + dy;
    emitChange();
    return;
  }

  if (interaction.mode === "start") {
    setFromEndpoints(pointer, interaction.fixedEnd);
    emitChange();
    return;
  }

  if (interaction.mode === "end") {
    setFromEndpoints(interaction.fixedStart, pointer);
    emitChange();
    return;
  }

  const currentAngle = pointerAngle(pointer, interaction.startCenter);
  const nextRotationRad = interaction.startRotationRad + (currentAngle - interaction.startPointerAngle);
  rotationDeg = (nextRotationRad * 180) / Math.PI;
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
  const initialLength = Math.max(MIN_LINE_LENGTH, initial.width);
  lineLength = initialLength;
  rotationDeg = initial.rotationDeg;
  centerX = initial.x;
  centerY = initial.y;

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

<svg
  class="tl-layer"
  bind:this={layerEl}
  width={viewport.width}
  height={viewport.height}
  viewBox={`0 0 ${viewport.width} ${viewport.height}`}
  preserveAspectRatio="none"
  style={`--tl-color: ${strokeColor};`}
>
  <line
    class="tl-hitline"
    x1={start.x}
    y1={start.y}
    x2={end.x}
    y2={end.y}
    role="button"
    tabindex="-1"
    aria-label="Move line"
    onpointerdown={beginMove}
  />
  <line class="tl-line" x1={start.x} y1={start.y} x2={end.x} y2={end.y} />
  <line class="tl-arm" x1={centerX} y1={centerY} x2={rotateHandle.x} y2={rotateHandle.y} />

  <circle
    class="tl-handle tl-start"
    cx={start.x}
    cy={start.y}
    r="8"
    role="button"
    tabindex="-1"
    aria-label="Move line start"
    onpointerdown={beginStart}
    onpointermove={updateInteraction}
    onpointerup={endInteraction}
    onpointercancel={endInteraction}
  />

  <circle
    class="tl-handle tl-end"
    cx={end.x}
    cy={end.y}
    r="8"
    role="button"
    tabindex="-1"
    aria-label="Move line end"
    onpointerdown={beginEnd}
    onpointermove={updateInteraction}
    onpointerup={endInteraction}
    onpointercancel={endInteraction}
  />

  <circle
    class="tl-handle tl-rotate"
    cx={rotateHandle.x}
    cy={rotateHandle.y}
    r="7"
    role="button"
    tabindex="-1"
    aria-label="Rotate line"
    onpointerdown={beginRotate}
    onpointermove={updateInteraction}
    onpointerup={endInteraction}
    onpointercancel={endInteraction}
  />
</svg>

<style>
.tl-layer {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
}

.tl-hitline {
  stroke: transparent;
  stroke-width: 20;
  stroke-linecap: round;
  pointer-events: all;
  cursor: move;
}

.tl-line {
  stroke: var(--tl-color);
  stroke-width: 3;
  stroke-linecap: round;
  pointer-events: none;
}

.tl-arm {
  stroke: color-mix(in srgb, var(--tl-color), #fff 35%);
  stroke-width: 1.5;
  stroke-dasharray: 4 3;
  pointer-events: none;
}

.tl-handle {
  fill: #fff;
  stroke: var(--tl-color);
  stroke-width: 2;
  pointer-events: all;
  cursor: grab;
}

.tl-start,
.tl-end {
  cursor: grab;
}

.tl-rotate {
  cursor: grab;
}
</style>
