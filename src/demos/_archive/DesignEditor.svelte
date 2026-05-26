<script lang="ts">
import { onMount } from "svelte";

import { createDemoElements, createElement, ElementStore } from "../design-editor-v0/ElementStore";
import { HitCanvas } from "../design-editor-v0/HitCanvas";
import { OverlayStateMachine } from "../design-editor-v0/overlayStateMachine";
import SelectLayer from "../design-editor-v0/SelectLayer.svelte";
import TransformLayer from "../design-editor-v0/TransformLayer.svelte";
import type { CanvasElement, ElementType } from "../design-editor-v0/types";

const DEFAULT_PAGE_W = 600;
const DEFAULT_PAGE_H = 400;

const elementStore = new ElementStore();
let selectLayerRef: {
  showTransformsHandle: (show?: boolean) => void;
  showBoundsHandle: (show?: boolean) => void;
} | null = null;

let hostEl: HTMLDivElement;
let canvasEl: HTMLCanvasElement;
let viewportW = $state(900);
let viewportH = $state(600);

let pageW = $state(DEFAULT_PAGE_W);
let pageH = $state(DEFAULT_PAGE_H);
let pageOffsetX = $state(0);
let pageOffsetY = $state(0);

let hoveredId = $state<string | null>(null);
let selectedId = $state<string | null>(null);
let previewPatch = $state<Partial<CanvasElement> | null>(null);
let previewId = $state<string | null>(null);
let hoveredElement = $state<CanvasElement | null>(null);
let selectedElement = $state<CanvasElement | null>(null);

let showBounds = $state(true);
let showTransforms = $state(true);
let hasSeededDemoElements = false;

const hitCanvas = new HitCanvas();
const overlayMachine = new OverlayStateMachine();

function syncOverlayState(): void {
  const snap = overlayMachine.snapshot;
  hoveredId = snap.hoveredIds[0] ?? null;
  selectedId = snap.selectedId;
}

function getSortedElements(): CanvasElement[] {
  return elementStore.order
    .map((id) => elementStore.elements.get(id))
    .filter((el): el is CanvasElement => !!el)
    .sort((a, b) => a.zIndex - b.zIndex);
}

function getRenderElements(): CanvasElement[] {
  const sorted = getSortedElements();
  return sorted.map((el) => {
    if (!previewPatch || !previewId || el.id !== previewId) return el;
    return { ...el, ...previewPatch } as CanvasElement;
  });
}

function getHitRenderables(renderElements: CanvasElement[]): CanvasElement[] {
  return renderElements.map((element) => ({
    ...element,
    drawHit(ctx: CanvasRenderingContext2D): void {
      ctx.save();
      ctx.translate(pageOffsetX, pageOffsetY);
      element.drawHit(ctx);
      ctx.restore();
    },
  }));
}

function pointerInHost(ev: PointerEvent): { x: number; y: number } {
  const rect = hostEl.getBoundingClientRect();
  return {
    x: ev.clientX - rect.left,
    y: ev.clientY - rect.top,
  };
}

function resolveDisplayedElement(id: string | null, renderList: CanvasElement[]): CanvasElement | null {
  if (!id) return null;
  return renderList.find((el) => el.id === id) ?? elementStore.elements.get(id) ?? null;
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pick<T>(values: T[]): T {
  return values[Math.floor(Math.random() * values.length)] as T;
}

function randomColors(): { fill: string; stroke: string } {
  const pairs = [
    { fill: "#fca5a5", stroke: "#7f1d1d" },
    { fill: "#93c5fd", stroke: "#1e3a8a" },
    { fill: "#86efac", stroke: "#14532d" },
    { fill: "#fdba74", stroke: "#7c2d12" },
    { fill: "#c4b5fd", stroke: "#4c1d95" },
  ];
  return pick(pairs);
}

function syncGeometry(): void {
  const rect = hostEl.getBoundingClientRect();
  viewportW = Math.max(1, Math.round(rect.width));
  viewportH = Math.max(1, Math.round(rect.height));

  canvasEl.width = viewportW;
  canvasEl.height = viewportH;

  // Keep a stable page size and center it in the viewport to preserve
  // the "gray surroundings + white page" design-editor visual model.
  pageW = Math.min(DEFAULT_PAGE_W, Math.max(240, viewportW - 48));
  pageH = Math.min(DEFAULT_PAGE_H, Math.max(180, viewportH - 72));
  pageOffsetX = Math.round((viewportW - pageW) / 2);
  pageOffsetY = Math.round((viewportH - pageH) / 2);

  hitCanvas.configureOffscreen(viewportW, viewportH);
  for (const element of getSortedElements()) {
    hitCanvas.initCandidate(element);
    element.hitcolor = element.hitColor;
  }
  redraw();
}

function redraw(): void {
  const ctx = canvasEl.getContext("2d");
  if (!ctx) return;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, viewportW, viewportH);

  const bg = ctx.createLinearGradient(0, 0, 0, viewportH);
  bg.addColorStop(0, "#e8ecf3");
  bg.addColorStop(1, "#dde3ee");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, viewportW, viewportH);

  ctx.save();
  ctx.shadowColor = "rgba(15, 23, 42, 0.2)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "rgba(37, 44, 62, 0.38)";
  ctx.lineWidth = 1;
  ctx.fillRect(pageOffsetX, pageOffsetY, pageW, pageH);
  ctx.strokeRect(pageOffsetX, pageOffsetY, pageW, pageH);
  ctx.restore();

  const renderElements = getRenderElements();

  // Pass 1: draw all content in grayscale.
  ctx.save();
  ctx.filter = "grayscale(100%) contrast(0.45)";
  ctx.translate(pageOffsetX, pageOffsetY);
  for (const element of renderElements) {
    if (!element.visible) continue;
    element.draw(ctx);
  }
  ctx.restore();

  // Pass 2: redraw content in color, clipped to the page rect.
  ctx.save();
  ctx.beginPath();
  ctx.rect(pageOffsetX, pageOffsetY, pageW, pageH);
  ctx.clip();
  ctx.filter = "none";
  ctx.translate(pageOffsetX, pageOffsetY);
  for (const element of renderElements) {
    if (!element.visible) continue;
    element.draw(ctx);
  }
  ctx.restore();

  hitCanvas.refresh(getHitRenderables(renderElements));

  selectedElement = resolveDisplayedElement(selectedId, renderElements);
  hoveredElement = resolveDisplayedElement(hoveredId, renderElements);
}

function elementAtPointer(ev: PointerEvent): CanvasElement | null {
  const p = pointerInHost(ev);
  const hitId = hitCanvas.lookup({ x: p.x, y: p.y });
  if (hitId < 1) return null;

  const found = [...elementStore.elements.values()].find((el) => el.hitId === hitId);
  return found ?? null;
}

function onPointerMove(ev: PointerEvent): void {
  const hit = elementAtPointer(ev);
  console.log(hit);
  overlayMachine.pointerMove(hit?.id ?? null);
  syncOverlayState();
  hoveredElement = hoveredId ? hit : null;
  redraw();
}

function onPointerDown(ev: PointerEvent): void {
  if (ev.button !== 0) return;
  const target = ev.target as Element | null;
  if (
    target?.closest(
      ".tf-handle, .tf-box, .tf-content-quad, .tf-rotate-arm, .tl-handle, .tl-line, .tl-arm",
    )
  ) {
    return;
  }

  const hit = elementAtPointer(ev);

  overlayMachine.pointerDown(hit?.id ?? null);
  syncOverlayState();

  selectedElement = hit;
  hoveredId = null;
  hoveredElement = null;
  previewId = null;
  previewPatch = null;
  elementStore.select(selectedId ? [selectedId] : []);
  redraw();
}

function onPointerUp(ev: PointerEvent): void {
  void ev;
}

function onTransform(payload: { id: string; patch: Partial<CanvasElement> }): void {
  overlayMachine.setSelected(payload.id);
  syncOverlayState();
  previewId = payload.id;
  previewPatch = payload.patch;
  redraw();
}

function onTransformEnd(payload: { id: string; patch: Partial<CanvasElement> }): void {
  const { id, patch } = payload;
  elementStore.updateProps([id], patch);
  previewPatch = null;
  previewId = null;
  redraw();
}

function attachElement(element: CanvasElement): void {
  hitCanvas.initCandidate(element);
  element.hitcolor = element.hitColor;
  elementStore.add(element);
}

function shiftedSeed(seed: CanvasElement): CanvasElement {
  return {
    ...seed,
    x: seed.x + pageW / 2,
    y: seed.y + pageH / 2,
    x2: seed.x2 !== undefined ? seed.x2 + pageW / 2 : undefined,
    y2: seed.y2 !== undefined ? seed.y2 + pageH / 2 : undefined,
  };
}

export function populateDemoElements(): void {
  if (hasSeededDemoElements) return;

  const seeds = createDemoElements(pageW, pageH);
  for (const seed of seeds) {
    attachElement(shiftedSeed(seed));
  }
  hasSeededDemoElements = true;
  redraw();
}

export function addRandom(type: ElementType): void {
  const { fill, stroke } = randomColors();
  const id = `${type}-${Math.random().toString(36).slice(2, 8)}`;
  const zIndex = elementStore.order.length;

  let el: CanvasElement;
  if (type === "rect") {
    el = createElement({
      id,
      type,
      name: id,
      x: rand(80, pageW - 240),
      y: rand(80, pageH - 180),
      width: rand(70, 180),
      height: rand(40, 140),
      fill,
      stroke,
      zIndex,
    });
  } else if (type === "circle") {
    const radius = rand(20, 62);
    el = createElement({
      id,
      type,
      name: id,
      x: rand(80, pageW - 160),
      y: rand(80, pageH - 160),
      width: radius * 2,
      height: radius * 2,
      radius,
      fill,
      stroke,
      zIndex,
    });
  } else if (type === "line") {
    const x1 = rand(100, pageW - 220);
    const y1 = rand(100, pageH - 220);
    const x2 = x1 + rand(-120, 160);
    const y2 = y1 + rand(-120, 160);
    el = createElement({
      id,
      type,
      name: id,
      x: x1,
      y: y1,
      width: x2 - x1,
      height: y2 - y1,
      x2,
      y2,
      fill: stroke,
      stroke,
      strokeWidth: 3,
      zIndex,
    });
  } else if (type === "star") {
    const outer = rand(24, 56);
    el = createElement({
      id,
      type,
      name: id,
      x: rand(80, pageW - 220),
      y: rand(80, pageH - 220),
      width: outer * 2,
      height: outer * 2,
      points: Math.floor(rand(5, 8)),
      innerRadius: outer * 0.45,
      outerRadius: outer,
      fill,
      stroke,
      zIndex,
    });
  } else {
    el = createElement({
      id,
      type: "image",
      name: id,
      x: rand(80, pageW - 280),
      y: rand(80, pageH - 220),
      width: rand(120, 220),
      height: rand(90, 170),
      fill: "#dbeafe",
      stroke: "#1d4ed8",
      zIndex,
    });
  }

  attachElement(el);
  redraw();
}

export function setShowBounds(show: boolean): void {
  showBounds = show;
  selectLayerRef?.showBoundsHandle(show);
}

export function setShowTransforms(show: boolean): void {
  showTransforms = show;
  selectLayerRef?.showTransformsHandle(show);
}

onMount(() => {
  const ro = new ResizeObserver(() => syncGeometry());
  ro.observe(hostEl);
  syncGeometry();

  // Failsafe: seed initial elements even if parent-level method timing misses.
  if (elementStore.order.length === 0) {
    populateDemoElements();
  }

  return () => {
    ro.disconnect();
    hitCanvas.destroy();
  };
});
</script>

<div
  class="editor"
  bind:this={hostEl}
  data-debug-name="editor-host"
  role="application"
  aria-label="Design editor canvas"
  onpointermove={onPointerMove}
  onpointerdown={onPointerDown}
  onpointerup={onPointerUp}
  onpointercancel={onPointerUp}
>
  <canvas bind:this={canvasEl} class="scene"></canvas>


  <SelectLayer
    bind:this={selectLayerRef}
    viewportW={viewportW}
    viewportH={viewportH}
    pageOffsetX={pageOffsetX}
    pageOffsetY={pageOffsetY}
    hovered={hoveredElement}
    selected={selectedElement}
    showBounds={showBounds}
    showTransforms={showTransforms}
    onTransform={onTransform}
    onTransformEnd={onTransformEnd}
  />

  <TransformLayer
    viewportW={viewportW}
    viewportH={viewportH}
    pageOffsetX={pageOffsetX}
    pageOffsetY={pageOffsetY} />
</div>

<style>
.editor {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 10px;
  background: #f5f7ff;
}

.scene {
  display: block;
  width: 100%;
  height: 100%;
}

</style>
