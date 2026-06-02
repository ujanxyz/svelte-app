<script lang="ts">
import { onMount } from "svelte";

import type { base } from "@/types/base";

import { DesignEditorEngine, type PointerInfo } from "./DesignEditorEngine";
import type { GraphicBase } from "./GraphicBase";
import { createGraphicSet } from "./GraphicFactories";
import { CubicBezierShape, PolygonGraphic } from "./GraphicTypes";
import { HitCanvas } from "./HitCanvas";
import { pageStore } from "./pageStore.svelte";
import TransformLayer, { type TransformMode } from "./TransformLayer.svelte";
import type { EditableCubicBezierPath } from "./types";
import type { IDimension, Point, RotatedRect } from "./types";

const DEBUG_LINE_V2 = true;
const HITCANVAS_ONSCREEN = true;

const hitCanvas = new HitCanvas();
let hitCanvasEl: HTMLCanvasElement | null = null;
let showHitCanvas = false;
let graphicsV2: GraphicBase[] = [];
const graphicByHitId = new Map<number, GraphicBase>();
const graphicById = new Map<string, GraphicBase>();
let tfMode: TransformMode = null;
let viewport = $state<IDimension>({ ...pageStore.pageDimension });
let activeTransformId = $state<string | null>(null);

function syncHitCanvasOverlayScale(): void {
  if (!hitCanvasEl) return;

  const rect = shellEl.getBoundingClientRect();
  const scale = Math.min(1, rect.width / pageStore.viewDimension.width, rect.height / pageStore.viewDimension.height);

  hitCanvasEl.style.width = `${pageStore.viewDimension.width}px`;
  hitCanvasEl.style.height = `${pageStore.viewDimension.height}px`;
  hitCanvasEl.style.transformOrigin = "top left";
  hitCanvasEl.style.transform = `scale(${scale})`;
}

function clearActiveTransform(): void {
  tfMode = null;
  activeTransformId = null;
  transform?.reset(null);
}

function onTransformChange(next: RotatedRect): void {
  if ((tfMode !== "tx" && tfMode !== "line") || !activeTransformId) return;
  const graphic = graphicById.get(activeTransformId) ?? null;
  if (!graphic) return;
  if (graphic.type === "line") {
    const normalizedLineTx = {
      x: next.x,
      y: next.y,
      width: next.width,
      height: 0,
      rotationDeg: next.rotationDeg,
    };
    graphic.updateTransform(normalizedLineTx);
    if (DEBUG_LINE_V2) {
      const tx = graphic.getTransform();
      if (tx.height !== 0) {
        console.warn("[LineV2] height drift detected", {
          activeTransformId,
          incoming: next,
          stored: tx,
        });
      } else {
        console.log("[LineV2] normalized transform", {
          activeTransformId,
          incoming: next,
          stored: tx,
        });
      }
    }
  } else {
    graphic.updateTransform(next);
  }

  engine.setElements(graphicsV2);
  refreshHitCanvas();
}

function onDeepEditPolygonCoordsChange(coords: base.XYPosition[]): void {
  if (!activeTransformId) return;
  const graphic = graphicById.get(activeTransformId);
  if (!(graphic instanceof PolygonGraphic)) return;

  graphic.updateCoords(coords);
  engine.setElements(graphicsV2);
  refreshHitCanvas();
}

function onDeepEditBezierPathChange(path: EditableCubicBezierPath): void {
  if (!activeTransformId) return;
  const graphic = graphicById.get(activeTransformId);
  if (!(graphic instanceof CubicBezierShape)) return;

  graphic.updatePath(path);
  engine.setElements(graphicsV2);
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
    hitCanvasEl.width = pageStore.viewDimension.width;
    hitCanvasEl.height = pageStore.viewDimension.height;
    hitCanvas.configureOnscreen(hitCanvasEl);
  } else {
    hitCanvas.configureOffscreen(pageStore.viewDimension.width, pageStore.viewDimension.height);
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
  const drawables = [...graphicsV2]
    .sort((a, b) => a.getZIndex() - b.getZIndex())
    .map((graphic) => {
    const { hitId, hitColor } = graphic.getHitData();
    return {
    hitId,
    hitColor,
    drawHit: (ctx: CanvasRenderingContext2D) => {
      ctx.save();
      ctx.translate(pageStore.viewDimension.width / 2, pageStore.viewDimension.height / 2);
      graphic.hitFn(ctx);
      ctx.restore();
    },
    };
    });

  hitCanvas.refresh(drawables);
}

function findHit(point: { x: number; y: number }): GraphicBase | null {
  const hitId = hitCanvas.lookup({
    x: point.x + pageStore.viewDimension.width / 2,
    y: point.y + pageStore.viewDimension.height / 2,
  });

  if (hitId < 0) return null;
  return graphicByHitId.get(hitId) ?? null;
}

function engine_handlePtrMove(point: Point): boolean {
  const hit = findHit(point);
  if (tfMode === "tx" || tfMode === "line") {
    return true;
  }
  if (hit) {
    const bounds = hit.getTransform();
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
    const bounds = hit.getTransform();
    activeTransformId = hit.id;
    tfMode = (hit.type === "line") ? "line" : "tx";

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

let engine!: DesignEditorEngine;

let container: HTMLDivElement;
let shellEl: HTMLDivElement;
let transform: TransformLayer | null = null;

onMount(() => {
  engine = new DesignEditorEngine({
    pageWidth: pageStore.pageDimension.width,
    pageHeight: pageStore.pageDimension.height,
    onZoomLevelChange: (nextZoomLevel) => {
      if (nextZoomLevel.zoom !== pageStore.zoomLevel.zoom) {
        clearActiveTransform();
      }
      pageStore.setZoomLevel(nextZoomLevel);
    },
    handlePtrMove: engine_handlePtrMove,
    handlePtrDown: engine_handlePtrDown,
    handlePtrUp: engine_handlePtrUp,
  });

  engine.mount(container);
  engine.setPageSize(pageStore.pageDimension.width, pageStore.pageDimension.height);
  graphicsV2 = createGraphicSet(14, pageStore.pageDimension);
  hitCanvas.initGraphics(graphicsV2);

  graphicByHitId.clear();
  graphicById.clear();
  for (const graphic of graphicsV2) {
    const { hitId } = graphic.getHitData();
    graphicByHitId.set(hitId, graphic);
    graphicById.set(graphic.id, graphic);
  }

  setupHitCanvas();
  syncHitCanvasOverlayScale();
  refreshHitCanvas();
  if (hitCanvasEl) {
    hitCanvasEl.style.opacity = showHitCanvas ? "1" : "0";
  }
  engine.setElements(graphicsV2);

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
    zoomLevel={pageStore.zoomLevel}
    {viewport}
    viewDimension={pageStore.viewDimension}
    activeGraphicType={activeTransformId ? (graphicById.get(activeTransformId)?.type ?? null) : null}
    deepEditCoords={activeTransformId && graphicById.get(activeTransformId) instanceof PolygonGraphic ? (graphicById.get(activeTransformId) as PolygonGraphic).getCoords() : null}
    deepEditBezierPath={activeTransformId && graphicById.get(activeTransformId) instanceof CubicBezierShape ? (graphicById.get(activeTransformId) as CubicBezierShape).getPath() : null}
    ondeepeditcoordschange={onDeepEditPolygonCoordsChange}
    ondeepeditbezierchange={onDeepEditBezierPathChange}
    onchange={onTransformChange}
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
