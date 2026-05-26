<script lang="ts">
import { onMount } from "svelte";

export type TransformLineState = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

type Interaction =
  | { mode: "start"; pointerId: number; startPointer: { x: number; y: number }; x1: number; y1: number; target: Element }
  | { mode: "end"; pointerId: number; startPointer: { x: number; y: number }; x2: number; y2: number; target: Element }
  | {
      mode: "rotate";
      pointerId: number;
      startPointerAngle: number;
      startX1: number;
      startY1: number;
      startX2: number;
      startY2: number;
      target: Element;
    };

type Props = {
  initialX1?: number;
  initialY1?: number;
  initialX2?: number;
  initialY2?: number;
  strokeColor?: string;
  onchange?: (state: TransformLineState) => void;
};

const {
  initialX1 = 200,
  initialY1 = 180,
  initialX2 = 420,
  initialY2 = 260,
  strokeColor = "#0f766e",
  onchange,
}: Props = $props();

let layerEl: HTMLDivElement;
let viewportW = $state(1);
let viewportH = $state(1);

let x1 = $state(200);
let y1 = $state(180);
let x2 = $state(420);
let y2 = $state(260);

let interaction = $state<Interaction | null>(null);

const mid = $derived({ x: (x1 + x2) / 2, y: (y1 + y2) / 2 });
const lineVec = $derived({ x: x2 - x1, y: y2 - y1 });
const lineLen = $derived(Math.max(1, Math.hypot(lineVec.x, lineVec.y)));
const perpUnit = $derived({ x: -lineVec.y / lineLen, y: lineVec.x / lineLen });
const rotateHandle = $derived({ x: mid.x + perpUnit.x * 34, y: mid.y + perpUnit.y * 34 });

function emitChange(): void {
  onchange?.({ x1, y1, x2, y2 });
}

function pointerInLayer(ev: PointerEvent): { x: number; y: number } {
  const rect = layerEl.getBoundingClientRect();
  return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
}

function angleAt(p: { x: number; y: number }, c: { x: number; y: number }): number {
  return Math.atan2(p.y - c.y, p.x - c.x);
}

function beginStart(ev: PointerEvent): void {
  if (ev.button !== 0) return;
  ev.preventDefault();
  const target = ev.currentTarget as Element;
  target.setPointerCapture(ev.pointerId);
  interaction = { mode: "start", pointerId: ev.pointerId, startPointer: pointerInLayer(ev), x1, y1, target };
}

function beginEnd(ev: PointerEvent): void {
  if (ev.button !== 0) return;
  ev.preventDefault();
  const target = ev.currentTarget as Element;
  target.setPointerCapture(ev.pointerId);
  interaction = { mode: "end", pointerId: ev.pointerId, startPointer: pointerInLayer(ev), x2, y2, target };
}

function beginRotate(ev: PointerEvent): void {
  if (ev.button !== 0) return;
  ev.preventDefault();
  const target = ev.currentTarget as Element;
  target.setPointerCapture(ev.pointerId);
  const p = pointerInLayer(ev);
  interaction = {
    mode: "rotate",
    pointerId: ev.pointerId,
    startPointerAngle: angleAt(p, mid),
    startX1: x1,
    startY1: y1,
    startX2: x2,
    startY2: y2,
    target,
  };
}

function onMove(ev: PointerEvent): void {
  if (!interaction || ev.pointerId !== interaction.pointerId) return;

  const p = pointerInLayer(ev);
  if (interaction.mode === "start") {
    const dx = p.x - interaction.startPointer.x;
    const dy = p.y - interaction.startPointer.y;
    x1 = interaction.x1 + dx;
    y1 = interaction.y1 + dy;
    emitChange();
    return;
  }

  if (interaction.mode === "end") {
    const dx = p.x - interaction.startPointer.x;
    const dy = p.y - interaction.startPointer.y;
    x2 = interaction.x2 + dx;
    y2 = interaction.y2 + dy;
    emitChange();
    return;
  }

  const currentAngle = angleAt(p, mid);
  const delta = currentAngle - interaction.startPointerAngle;

  const rotatePoint = (sx: number, sy: number): { x: number; y: number } => {
    const dx = sx - mid.x;
    const dy = sy - mid.y;
    const c = Math.cos(delta);
    const s = Math.sin(delta);
    return { x: mid.x + dx * c - dy * s, y: mid.y + dx * s + dy * c };
  };

  const p1 = rotatePoint(interaction.startX1, interaction.startY1);
  const p2 = rotatePoint(interaction.startX2, interaction.startY2);
  x1 = p1.x;
  y1 = p1.y;
  x2 = p2.x;
  y2 = p2.y;
  emitChange();
}

function endInteraction(ev: PointerEvent): void {
  if (!interaction || ev.pointerId !== interaction.pointerId) return;
  if (interaction.target.hasPointerCapture(ev.pointerId)) {
    interaction.target.releasePointerCapture(ev.pointerId);
  }
  interaction = null;
}

onMount(() => {
  x1 = initialX1;
  y1 = initialY1;
  x2 = initialX2;
  y2 = initialY2;

  const ro = new ResizeObserver((entries) => {
    const rect = entries[0]?.contentRect;
    if (!rect) return;
    viewportW = Math.max(1, Math.round(rect.width));
    viewportH = Math.max(1, Math.round(rect.height));
  });
  ro.observe(layerEl);
  return () => ro.disconnect();
});
</script>

<div class="tl-layer" bind:this={layerEl} style={`--tl-color: ${strokeColor};`}>
  <svg width="100%" height="100%" viewBox={`0 0 ${viewportW} ${viewportH}`}>
    <line class="tl-line" x1={x1} y1={y1} x2={x2} y2={y2} />
    <line class="tl-arm" x1={mid.x} y1={mid.y} x2={rotateHandle.x} y2={rotateHandle.y} />

    <circle class="tl-handle tl-start" cx={x1} cy={y1} r="8" role="button" tabindex="-1" aria-label="Move line start" onpointerdown={beginStart} onpointermove={onMove} onpointerup={endInteraction} onpointercancel={endInteraction} />
    <circle class="tl-handle tl-end" cx={x2} cy={y2} r="8" role="button" tabindex="-1" aria-label="Move line end" onpointerdown={beginEnd} onpointermove={onMove} onpointerup={endInteraction} onpointercancel={endInteraction} />
    <circle class="tl-handle tl-rotate" cx={rotateHandle.x} cy={rotateHandle.y} r="7" role="button" tabindex="-1" aria-label="Rotate line" onpointerdown={beginRotate} onpointermove={onMove} onpointerup={endInteraction} onpointercancel={endInteraction} />
  </svg>
</div>

<style>
.tl-layer {
  position: absolute;
  inset: 0;
  z-index: 4;
}
.tl-line {
  stroke: var(--tl-color);
  stroke-width: 3;
  stroke-linecap: round;
}
.tl-arm {
  stroke: color-mix(in srgb, var(--tl-color), #fff 35%);
  stroke-width: 1.5;
  stroke-dasharray: 4 3;
}
.tl-handle {
  fill: #fff;
  stroke: var(--tl-color);
  stroke-width: 2;
}
.tl-start,
.tl-end {
  cursor: move;
}
.tl-rotate {
  cursor: grab;
}
</style>
