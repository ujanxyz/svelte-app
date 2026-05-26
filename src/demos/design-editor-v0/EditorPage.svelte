<script lang="ts">
import { onMount } from "svelte";

import type { base } from "@/types/base";

import { DesignEditorEngine } from "./DesignEditorEngine";
import { createDemoElements } from "./ElementStore";
import { HitCanvas } from "./HitCanvas";
import TransformLayer from "./TransformLayer.svelte";
import type { CanvasElement } from "./types";

const HITCANVAS_ONSCREEN = true;
const PAGE_WIDTH = 800;
const PAGE_HEIGHT = 600;

const hitCanvas = new HitCanvas();
let hitCanvasEl: HTMLCanvasElement | null = null;
let showHitCanvas = false;
let shapes: CanvasElement[] = [];
const shapeByHitId = new Map<number, CanvasElement>();
let zoomLevel: base.ZoomLevel = { x: 0, y: 0, zoom: 1 };

function setupHitCanvas(): void {
  if (HITCANVAS_ONSCREEN) {
    if (!hitCanvasEl) {
      hitCanvasEl = document.createElement("canvas");
      hitCanvasEl.style.position = "absolute";
      hitCanvasEl.style.inset = "0";
      hitCanvasEl.style.pointerEvents = "none";
      hitCanvasEl.style.opacity = "0";
      hitCanvasEl.style.zIndex = "2";
      container.appendChild(hitCanvasEl);
    }
    hitCanvasEl.width = PAGE_WIDTH;
    hitCanvasEl.height = PAGE_HEIGHT;
    hitCanvas.configureOnscreen(hitCanvasEl);
  } else {
    hitCanvas.configureOffscreen(PAGE_WIDTH, PAGE_HEIGHT);
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
    hitcolor: shape.hitColor,
    drawHit: (ctx: CanvasRenderingContext2D) => {
      ctx.save();
      ctx.translate(PAGE_WIDTH / 2, PAGE_HEIGHT / 2);
      shape.drawHit(ctx);
      ctx.restore();
    },
    }));

  hitCanvas.refresh(drawables);
}

function findHit(point: { x: number; y: number }): CanvasElement | null {
  const hitId = hitCanvas.lookup({
    x: point.x + PAGE_WIDTH / 2,
    y: point.y + PAGE_HEIGHT / 2,
  });

  if (hitId < 0) return null;
  return shapeByHitId.get(hitId) ?? null;
}

const engine = new DesignEditorEngine({
  pageWidth: PAGE_WIDTH,
  pageHeight: PAGE_HEIGHT,
  onZoomLevelChange: (nextZoomLevel) => {
    zoomLevel = nextZoomLevel;
    console.log("zoomLevel", nextZoomLevel);
  },
  handlePtrMove: (point) => {
    const hit = findHit(point);
    if (hit) {
      const bounds = hit.getBounds();
      transform?.reset({
        mode: "hover",
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        rotationDeg: hit.rotation ?? 0,
      });
      // console.log("Pointer move hit", { id: hit.id, hitId: hit.hitId, point });
      return true;
    }
    transform?.reset(null);
    return false;
  },
  handlePtrDown: (point) => {
    const hit = findHit(point);
    if (hit) {
      const bounds = hit.getBounds();
      transform?.reset({
        mode: "hover",
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        rotationDeg: hit.rotation ?? 0,
      });
      console.log("Pointer down hit", { id: hit.id, hitId: hit.hitId, point });
      return true;
    }
    transform?.reset(null);
    return false;
  },
  handlePtrUp: (point) => {
    console.log("Pointer up", point);
    // transform?.reset(null);
    return false;
  },
});

let container: HTMLDivElement;
let transform: TransformLayer | null = null;

onMount(() => {
  engine.mount(container);
  engine.setPageSize(PAGE_WIDTH, PAGE_HEIGHT);
  shapes = createDemoElements(PAGE_WIDTH, PAGE_HEIGHT);

  shapeByHitId.clear();
  for (const shape of shapes) {
    hitCanvas.initCandidate(shape);
    shape.hitcolor = shape.hitColor;
    shapeByHitId.set(shape.hitId, shape);
  }

  setupHitCanvas();
  refreshHitCanvas();
  if (hitCanvasEl) {
    hitCanvasEl.style.opacity = showHitCanvas ? "1" : "0";
  }
  engine.setShapes(shapes);

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
    hitCanvas.destroy();
    hitCanvasEl?.remove();
    hitCanvasEl = null;
  };
});

</script>

<div class="shell">
  <div class="content" bind:this={container}>
  </div>
  <TransformLayer
    bind:this={transform}
    {zoomLevel}
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
