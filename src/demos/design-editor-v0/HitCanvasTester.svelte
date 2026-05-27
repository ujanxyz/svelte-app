<script lang="ts">
import { onMount } from "svelte";

import { getAppIcon } from "@/utils/appIcons";
import { newRandomId } from "@/jsutils/idUtils";

import { createElement } from "./ElementStore";
import { HitCanvas } from "./HitCanvas";
import type { CanvasElement } from "./types";

let sceneEl: HTMLCanvasElement;
let hitEl: HTMLCanvasElement;
let stackEl: HTMLDivElement;

let shapes = $state.raw<CanvasElement[]>([]);
let hoverSummary = $state("None");
let downSummary = $state("None");
let useOffscreen = $state(false);
let showHitCanvas = $state(false);

let hitCanvas: HitCanvas | null = null;

const LineSegmentIcon = getAppIcon("line-segment");
const RectangleIcon = getAppIcon("rectangle");
const CircleIcon = getAppIcon("circle");
const StarIcon = getAppIcon("star");

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pick<T>(values: T[]): T {
  return values[Math.floor(Math.random() * values.length)] as T;
}

function colorPair(): { fill: string; stroke: string } {
  const pairs = [
    { fill: "#fca5a5", stroke: "#7f1d1d" },
    { fill: "#93c5fd", stroke: "#1e3a8a" },
    { fill: "#86efac", stroke: "#14532d" },
    { fill: "#fdba74", stroke: "#7c2d12" },
    { fill: "#c4b5fd", stroke: "#4c1d95" },
  ];
  return pick(pairs);
}

function drawScene(): void {
  const ctx = sceneEl.getContext("2d");
  if (!ctx) return;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, sceneEl.width, sceneEl.height);
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, sceneEl.width, sceneEl.height);

  const sorted = [...shapes].sort((a, b) => a.zIndex - b.zIndex);
  for (const shape of sorted) {
    shape.draw(ctx);
  }

  hitCanvas?.refresh(sorted);
}

function shapeSummary(shape: CanvasElement): string {
  return `${shape.type} | id=${shape.id} | hitId=${shape.hitId} | hit=${shape.hitColor}`;
}

function findByHitId(hitId: number): CanvasElement | undefined {
  return shapes.find((s) => s.hitId === hitId);
}

function addShape(type: "line" | "rect" | "circle" | "star"): void {
  const { fill, stroke } = colorPair();
  const id = `${type}-${newRandomId().slice(0, 6)}`;
  const zIndex = shapes.length;

  let shape: CanvasElement;
  if (type === "rect") {
    const width = rand(60, 140);
    const height = rand(40, 110);
    shape = createElement({
      id,
      type,
      name: id,
      x: rand(40, 540),
      y: rand(40, 300),
      width,
      height,
      fill,
      stroke,
      zIndex,
    });
  } else if (type === "circle") {
    const radius = rand(20, 58);
    shape = createElement({
      id,
      type,
      name: id,
      x: rand(60, 560) - radius,
      y: rand(60, 320) - radius,
      width: radius * 2,
      height: radius * 2,
      radius,
      fill,
      stroke,
      zIndex,
    });
  } else if (type === "line") {
    const x1 = rand(40, 560);
    const y1 = rand(40, 320);
    const x2 = rand(40, 560);
    const y2 = rand(40, 320);
    shape = createElement({
      id,
      type,
      name: id,
      x: x1,
      y: y1,
      width: Math.hypot(x2 - x1, y2 - y1),
      height: 0,
      rotation: (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI,
      fill: stroke,
      stroke,
      strokeWidth: 3,
      zIndex,
    });
  } else {
    const outer = rand(28, 52);
    const width = outer * 2;
    const height = outer * 2;
    shape = createElement({
      id,
      type,
      name: id,
      x: rand(80, 540) - outer,
      y: rand(80, 300) - outer,
      width,
      height,
      points: Math.floor(rand(3, 8)),
      innerRadius: rand(12, 24),
      outerRadius: outer,
      fill,
      stroke,
      zIndex,
    });
  }

  hitCanvas?.initCandidate(shape);

  shapes = [...shapes, shape];
  drawScene();
}

function scenePoint(ev: PointerEvent): { x: number; y: number } {
  const rect = stackEl.getBoundingClientRect();
  const sx = sceneEl.width / Math.max(1, rect.width);
  const sy = sceneEl.height / Math.max(1, rect.height);
  return {
    x: (ev.clientX - rect.left) * sx,
    y: (ev.clientY - rect.top) * sy,
  };
}

function onStackMove(ev: PointerEvent): void {
  if (!hitCanvas) return;
  const p = scenePoint(ev);
  const hitId = hitCanvas.lookup(p);
  const hit = findByHitId(hitId);
  hoverSummary = hit ? shapeSummary(hit) : "None";
}

function onStackDown(ev: PointerEvent): void {
  if (!hitCanvas) return;
  const p = scenePoint(ev);
  const hitId = hitCanvas.lookup(p);
  const hit = findByHitId(hitId);
  downSummary = hit ? shapeSummary(hit) : "None";
}

function setupHitCanvas(): void {
  hitCanvas?.destroy();
  hitCanvas = new HitCanvas();
  if (useOffscreen) {
    hitCanvas.configureOffscreen(hitEl.width, hitEl.height);
  } else {
    hitCanvas.configureOnscreen(hitEl);
  }

  // Reinitialize existing shapes against the new HitCanvas instance.
  for (const shape of shapes) {
    hitCanvas.initCandidate(shape);
  }

  drawScene();
}

function onToggleOffscreen(checked: boolean): void {
  useOffscreen = checked;
  if (useOffscreen) showHitCanvas = false;
  setupHitCanvas();
}

function toggleShowHit(): void {
  if (useOffscreen) return;
  showHitCanvas = !showHitCanvas;
}

onMount(() => {
  sceneEl.width = 640;
  sceneEl.height = 380;
  hitEl.width = 640;
  hitEl.height = 380;

  setupHitCanvas();

  for (let i = 0; i < 10; i += 1) {
    addShape(pick(["line", "rect", "circle", "star"]));
  }

  drawScene();

  return () => {
    hitCanvas?.destroy();
    hitCanvas = null;
  };
});
</script>

<div class="hc-wrap">
  <div class="controls">
    <button class="add-btn" onclick={() => addShape("line")}><span>+ line</span><LineSegmentIcon size={15} /></button>
    <button class="add-btn" onclick={() => addShape("rect")}><span>+ rect</span><RectangleIcon size={15} /></button>
    <button class="add-btn" onclick={() => addShape("circle")}><span>+ circle</span><CircleIcon size={15} /></button>
    <button class="add-btn" onclick={() => addShape("star")}><span>+ star</span><StarIcon size={15} /></button>
  </div>

  <div class="toggles">
    <label>
      <input
        type="checkbox"
        checked={useOffscreen}
        onchange={(ev) => onToggleOffscreen((ev.currentTarget as HTMLInputElement).checked)}
      />
      Use Offscreen (in hit-Canvas)
    </label>
    <button
      type="button"
      class="show-hit-btn"
      onclick={toggleShowHit}
      disabled={useOffscreen}
      aria-pressed={showHitCanvas}
    >
      Show Hit-Canvas
    </button>
  </div>

  <div class="stage">
    <div class="panels">
      <div class="panel"><div class="panel-title">Hovered</div><div>{hoverSummary}</div></div>
      <div class="panel"><div class="panel-title">Pointer Down</div><div>{downSummary}</div></div>
    </div>

    <div class="canvas-stack" bind:this={stackEl} role="application" aria-label="Hit canvas interaction surface" onpointermove={onStackMove} onpointerdown={onStackDown}>
      <canvas bind:this={sceneEl} class="scene"></canvas>
      <canvas bind:this={hitEl} class="hit" style={`opacity: ${showHitCanvas && !useOffscreen ? 1 : 0};`} ></canvas>
    </div>

    <div class="footer">Elements: {shapes.length}</div>
  </div>
</div>

<style>
.hc-wrap {
  --radius: 6px;
  --space-1: 6px;
  --space-2: 8px;
  --space-3: 10px;
  --space-4: 12px;
  --line: #cbd5e1;
  --line-soft: #e2e8f0;
  --bg: #ffffff;
  --bg-soft: #f8fafc;
  --ink: #0f172a;
  --ink-subtle: #475569;
  --text-primary: 0.92rem;

  display: grid;
  gap: var(--space-3);
  width: min(96vw, 720px);
  margin: 0 auto;
  font-size: var(--text-primary);
  color: var(--ink);
}

.controls {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.add-btn {
  min-height: 32px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 0 var(--space-3);
  background: var(--bg);
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}

.toggles {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
  align-items: center;
}

.toggles label {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--ink-subtle);
}

.show-hit-btn {
  min-height: 32px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 0 var(--space-3);
  background: var(--bg);
  color: var(--ink);
}

.show-hit-btn[aria-pressed="true"] {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #ffffff;
}

.show-hit-btn:disabled {
  opacity: 0.55;
}

.stage {
  display: grid;
  gap: var(--space-2);
  width: 100%;
}

.panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2);
  width: 100%;
}

.panel {
  border: 1px solid var(--line-soft);
  border-radius: var(--radius);
  background: var(--bg);
  padding: var(--space-2);
  font-size: 0.84rem;
}

.panel-title {
  font-weight: 700;
  margin-bottom: 2px;
}

.canvas-stack {
  position: relative;
  width: 100%;
  aspect-ratio: 640 / 380;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--bg-soft);
}

.scene,
.hit {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.hit {
  z-index: 3;
  pointer-events: none;
  transition: opacity 130ms ease;
}

.scene {
  z-index: 2;
}

.footer {
  border: 1px solid var(--line-soft);
  border-radius: var(--radius);
  background: var(--bg);
  color: var(--ink-subtle);
  font-size: 0.76rem;
  padding: 6px var(--space-2);
}
</style>
