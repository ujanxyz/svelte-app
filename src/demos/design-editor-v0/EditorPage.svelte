<script lang="ts">
import { onMount } from "svelte";

import type { base } from "@/types/base";

import { DesignEditorEngine, type PointerInfo, VIEW_SCALE } from "./DesignEditorEngine";
import { createDemoElements } from "./ElementStore";
import { HitCanvas } from "./HitCanvas";
import TransformLayer, { type TransformMode } from "./TransformLayer.svelte";
import type { CanvasElement, IDimension, Point, RotatedRect } from "./types";

const HITCANVAS_ONSCREEN = true;
const PAGE_WIDTH = 800;
const PAGE_HEIGHT = 600;
const VIEW_WIDTH = PAGE_WIDTH * VIEW_SCALE;
const VIEW_HEIGHT = PAGE_HEIGHT * VIEW_SCALE;

const hitCanvas = new HitCanvas();
let hitCanvasEl: HTMLCanvasElement | null = null;
let showHitCanvas = false;
let shapes: CanvasElement[] = [];
const shapeByHitId = new Map<number, CanvasElement>();
const shapeById = new Map<string, CanvasElement>();
let zoomLevel = $state<base.ZoomLevel>({ x: 0, y: 0, zoom: 1 });
let tfMode: TransformMode = null;
let viewport = $state<IDimension>({ width: PAGE_WIDTH, height: PAGE_HEIGHT });
let activeTransformId: string | null = null;

function syncHitCanvasOverlayScale(): void {
  if (!hitCanvasEl) return;

  const rect = shellEl.getBoundingClientRect();
  const scale = Math.min(1, rect.width / VIEW_WIDTH, rect.height / VIEW_HEIGHT);

  hitCanvasEl.style.width = `${VIEW_WIDTH}px`;
  hitCanvasEl.style.height = `${VIEW_HEIGHT}px`;
  hitCanvasEl.style.transformOrigin = "top left";
  hitCanvasEl.style.transform = `scale(${scale})`;
}

function clearActiveTransform(): void {
  tfMode = null;
  activeTransformId = null;
  transform?.reset(null);
}

function applyFrameTransformToElement(element: CanvasElement, next: RotatedRect): void {
  element.x = next.x;
  element.y = next.y;
  element.width = next.width;
  element.height = element.type === "line" ? 0 : next.height;
  element.rotation = next.rotationDeg;

  if (element.type === "circle") {
    element.radius = Math.min(next.width, next.height) / 2;
  }

  if (element.type === "star") {
    const prevOuter = element.outerRadius ?? Math.max(element.width, element.height) / 2;
    const prevInner = element.innerRadius ?? prevOuter * 0.5;
    const ratio = prevOuter > 0 ? prevInner / prevOuter : 0.5;
    const outer = Math.max(next.width, next.height) / 2;
    element.outerRadius = outer;
    element.innerRadius = outer * ratio;
  }
}

function onTransformFrameChange(next: RotatedRect): void {
  if ((tfMode !== "tx" && tfMode !== "line") || !activeTransformId) return;
  const target = shapeById.get(activeTransformId) ?? null;
  if (!target) return;

  applyFrameTransformToElement(target, next);

  engine.setShapes(shapes);
  refreshHitCanvas();
}

function setupHitCanvas(): void {
  if (HITCANVAS_ONSCREEN) {
    if (!hitCanvasEl) {
      hitCanvasEl = document.createElement("canvas");
      hitCanvasEl.style.position = "absolute";
      hitCanvasEl.style.left = "0";
      hitCanvasEl.style.top = "0";
      hitCanvasEl.style.pointerEvents = "none";
      hitCanvasEl.style.opacity = "0";
      hitCanvasEl.style.zIndex = "2";
      container.appendChild(hitCanvasEl);
    }
    hitCanvasEl.width = VIEW_WIDTH;
    hitCanvasEl.height = VIEW_HEIGHT;
    hitCanvas.configureOnscreen(hitCanvasEl);
  } else {
    hitCanvas.configureOffscreen(VIEW_WIDTH, VIEW_HEIGHT);
  }
}

function handleKeyDown(ev: KeyboardEvent): void {
  if (ev.code !== "Space") return;
  ev.preventDefault();
  showHitCanvas = !showHitCanvas;
  if (hitCanvasEl) {
    hitCanvasEl.style.opacity = showHitCanvas ? "1" : "0";
    if (hitCanvasEl.parentElement !== container) {
      container.appendChild(hitCanvasEl);
    }
  }
}

function refreshHitCanvas(): void {
  const drawables = [...shapes]
    .sort((a, b) => a.zIndex - b.zIndex)
    .map((shape) => ({
    hitId: shape.hitId,
    hitColor: shape.hitColor,
    drawHit: (ctx: CanvasRenderingContext2D) => {
      ctx.save();
      ctx.translate(VIEW_WIDTH / 2, VIEW_HEIGHT / 2);
      shape.drawHit(ctx);
      ctx.restore();
    },
    }));

  hitCanvas.refresh(drawables);
}

function findHit(point: { x: number; y: number }): CanvasElement | null {
  const hitId = hitCanvas.lookup({
    x: point.x + VIEW_WIDTH / 2,
    y: point.y + VIEW_HEIGHT / 2,
  });

  if (hitId < 0) return null;
  return shapeByHitId.get(hitId) ?? null;
}

function engine_handlePtrMove(point: Point): boolean {
  const hit = findHit(point);
  if (tfMode === "tx") {
    return true;
  }

  if (tfMode === "line") {
    return true;
  }
  if (hit) {
    const bounds = hit.getBounds();
    activeTransformId = hit.id;
    tfMode = "hover";

    transform?.reset({
      mode: tfMode,
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      rotationDeg: bounds.rotationDeg,
    });
    return true;
  }
  clearActiveTransform();
  return false;
}

function engine_handlePtrDown(point: Point, pointer: PointerInfo): boolean {
  const hit = findHit(point);
  if (hit) {
    const bounds = hit.getBounds();
    activeTransformId = hit.id;

    if (hit.type === "line") {
      tfMode = "line";
    } else {
      tfMode = "tx";
    }

    transform?.reset({
      mode: tfMode,
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      rotationDeg: bounds.rotationDeg,
      activePointer: pointer,
    });
    return true;
  }

  transform?.reset(null);
  tfMode = null;
  activeTransformId = null;
  return false;
}

function engine_handlePtrUp(point: Point): boolean {
  if (tfMode === null) {
    transform?.reset(null);
    activeTransformId = null;
    return false;
  }
  return true;
}

const engine = new DesignEditorEngine({
  pageWidth: PAGE_WIDTH,
  pageHeight: PAGE_HEIGHT,
  onZoomLevelChange: (nextZoomLevel) => {
    if (nextZoomLevel.zoom !== zoomLevel.zoom) {
      clearActiveTransform();
    }
    zoomLevel = nextZoomLevel;
  },
  handlePtrMove: engine_handlePtrMove,
  handlePtrDown: engine_handlePtrDown,
  handlePtrUp: engine_handlePtrUp,
});

let container: HTMLDivElement;
let shellEl: HTMLDivElement;
let transform: TransformLayer | null = null;

onMount(() => {
  engine.mount(container);
  engine.setPageSize(PAGE_WIDTH, PAGE_HEIGHT);
  shapes = createDemoElements(PAGE_WIDTH, PAGE_HEIGHT);

  shapeByHitId.clear();
  shapeById.clear();
  for (const shape of shapes) {
    hitCanvas.initCandidate(shape);
    shapeByHitId.set(shape.hitId, shape);
    shapeById.set(shape.id, shape);
  }

  setupHitCanvas();
  syncHitCanvasOverlayScale();
  refreshHitCanvas();
  if (hitCanvasEl) {
    hitCanvasEl.style.opacity = showHitCanvas ? "1" : "0";
  }
  engine.setShapes(shapes);

  const syncViewport = (): void => {
    const rect = shellEl.getBoundingClientRect();
    viewport = {
      width: Math.max(1, Math.round(rect.width)),
      height: Math.max(1, Math.round(rect.height)),
    };

    syncHitCanvasOverlayScale();

    // Resize invalidates pointer coordinate mapping, so clear active overlays.
    clearActiveTransform();
  };

  const ro = new ResizeObserver(() => {
    syncViewport();
  });

  syncViewport();
  ro.observe(shellEl);

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
    ro.disconnect();
    hitCanvas.destroy();
    hitCanvasEl?.remove();
    hitCanvasEl = null;
  };
});

</script>

<div class="shell" bind:this={shellEl}>
  <div class="content" bind:this={container}>
  </div>
  <TransformLayer
    bind:this={transform}
    {zoomLevel}
    {viewport}
    onchange={onTransformFrameChange}
  />
</div>

<style>
.shell {
  position: relative;
  width: 100%;
  height: 100%;
  border: 0.5px solid rgba(0, 0, 0, 0.35);
  overflow: hidden;
}
.content {
  position: absolute;
  inset: 0;
  z-index: 1;
}
</style>
