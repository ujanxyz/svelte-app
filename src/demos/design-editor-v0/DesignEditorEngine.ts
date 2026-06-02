import { drawAdaptiveGrid } from "./AdaptiveGrid";
import { Camera2D } from "./Camera2D";
import type { GraphicBase } from "./GraphicBase";
import type { Point, Rect } from "./types";

export type ZoomLevel = {
  x: number;
  y: number;
  zoom: number;
};

export type PointerInfo = {
  pointerId: number;
  clientX: number;
  clientY: number;
};

export const VIEW_SCALE = 1.6;

export interface DesignEditorEngineOptions {
  pageWidth: number;
  pageHeight: number;

  // Handle pointer events in client code instead of the engine.
  // This allows implementing custom behaviors like selection, dragging, etc. in client code.
  handlePtrMove(point: Point, pointer: PointerInfo): boolean;
  handlePtrDown(point: Point, pointer: PointerInfo): boolean;
  handlePtrUp(point: Point, pointer: PointerInfo): boolean;
  onZoomLevelChange(zoomLevel: ZoomLevel): void;
}

export class DesignEditorEngine {
  private readonly camera: Camera2D;
  private readonly handlePtrMove: (point: Point, pointer: PointerInfo) => boolean;
  private readonly handlePtrDown: (point: Point, pointer: PointerInfo) => boolean;
  private readonly handlePtrUp: (point: Point, pointer: PointerInfo) => boolean;
  private readonly onZoomLevelChange: (zoomLevel: ZoomLevel) => void;

  private pageRect: Rect;
  private viewRect: Rect;

  private graphicElems: GraphicBase[] = [];

  private container: HTMLDivElement | null = null;
  private wheelEventTarget: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private offscreenCanvas: HTMLCanvasElement | null = null;
  private offscreenCtx: CanvasRenderingContext2D | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private viewportWidth = 0;
  private viewportHeight = 0;
  private dpr = 1;

  // Using requestAnimationFrame to batch multiple updates into a single render.
  private rafId = 0;
  private dirty = false;

  private isDragging = false;
  private dragLast: Point = { x: 0, y: 0 };

  public constructor(options: DesignEditorEngineOptions) {
    this.camera = new Camera2D(0.25, 4);
    this.handlePtrMove = options.handlePtrMove;
    this.handlePtrDown = options.handlePtrDown;
    this.handlePtrUp = options.handlePtrUp;
    this.onZoomLevelChange = options.onZoomLevelChange;

    const pageWidth = options.pageWidth ?? 600;
    const pageHeight = options.pageHeight ?? 400;
    // this.setPageSize(pageWidth, pageHeight);

    this.pageRect = {
      x: -pageWidth / 2,
      y: -pageHeight / 2,
      width: pageWidth,
      height: pageHeight,
    };

    this.viewRect = {
      x: -(VIEW_SCALE * pageWidth) / 2,
      y: -(VIEW_SCALE * pageHeight) / 2,
      width: VIEW_SCALE * pageWidth,
      height: VIEW_SCALE * pageHeight,
    };

    console.log(this.pageRect, this.viewRect);
  }

  public mount(container: HTMLDivElement): void {
    if (this.container) {
      throw new Error("DesignEditorEngine is already mounted");
    }

    this.container = container;
    this.canvas = document.createElement("canvas");
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.position = "absolute";
    this.canvas.style.inset = "0";
    this.canvas.style.zIndex = "1";
    this.canvas.style.display = "block";
    this.canvas.style.touchAction = "none";

    this.ctx = this.canvas.getContext("2d");

    this.offscreenCanvas = document.createElement("canvas");
    this.offscreenCtx = this.offscreenCanvas.getContext("2d");
    if (!this.offscreenCtx) {
      throw new Error("Failed to create offscreen 2D canvas context");
    }

    container.appendChild(this.canvas);

    this.wheelEventTarget = container.parentElement ?? container;

    this.canvas.addEventListener("pointerdown", this.#onPointerDown);
    this.canvas.addEventListener("pointermove", this.#onPointerMove);
    this.canvas.addEventListener("pointerup", this.#onPointerUp);
    this.canvas.addEventListener("pointerleave", this.#onPointerLeave);
    this.wheelEventTarget.addEventListener("wheel", this.#onWheel, { passive: false });

    this.resizeObserver = new ResizeObserver(() => {
      this.syncCanvasSize();
      this.#invalidate();
    });
    this.resizeObserver.observe(container);

    this.syncCanvasSize();
    this.camera.clampCenterToView(this.viewRect, this.viewportWidth, this.viewportHeight);
    this.#emitZoomLevel();
    this.#invalidate();
  }

  public destroy(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.canvas) {
      this.canvas.removeEventListener("pointerdown", this.#onPointerDown);
      this.canvas.removeEventListener("pointermove", this.#onPointerMove);
      this.canvas.removeEventListener("pointerup", this.#onPointerUp);
      this.canvas.removeEventListener("pointerleave", this.#onPointerLeave);
      this.canvas.remove();
    }

    this.wheelEventTarget?.removeEventListener("wheel", this.#onWheel);
    this.wheelEventTarget = null;

    this.ctx = null;
    this.canvas = null;
    this.offscreenCtx = null;
    this.offscreenCanvas = null;
    this.container = null;
  }

  public setElements(elements: GraphicBase[]): void {
    this.graphicElems = [...elements].sort((a, b) => a.getZIndex() - b.getZIndex());
    this.#invalidate();
  }

  public setPageSize(width: number, height: number): void {
    this.pageRect = {
      x: -width / 2,
      y: -height / 2,
      width,
      height,
    };
    const surfWidth = width * VIEW_SCALE;
    const surfHeight = height * VIEW_SCALE;
    this.viewRect = {
      x: -surfWidth / 2,
      y: -surfHeight / 2,
      width: surfWidth,
      height: surfHeight,
    };
    console.log(this.pageRect, this.viewRect);
    this.#setZoomConstrainedToView(this.camera.zoom);
    this.camera.clampCenterToView(this.viewRect, this.viewportWidth, this.viewportHeight);
    this.#emitZoomLevel();
    this.#invalidate();
  }

  #emitZoomLevel(): void {
    this.onZoomLevelChange({
      x: this.camera.centerX,
      y: this.camera.centerY,
      zoom: this.camera.zoom,
    });
  }

  #setZoomConstrainedToView(nextZoom: number): void {
    // Keep the camera view fully inside viewRect when zooming out.
    // Once the visible world would exceed the buffered view bounds,
    // zoom-out is locked at that boundary-derived minimum zoom.
    const minZoom =
      this.viewportWidth <= 0 || this.viewportHeight <= 0
        ? this.camera.minZoom
        : Math.max(
            this.camera.minZoom,
            this.viewportWidth / Math.max(1, this.viewRect.width),
            this.viewportHeight / Math.max(1, this.viewRect.height),
          );
    const clampedZoom = Math.min(this.camera.maxZoom, Math.max(minZoom, nextZoom));
    this.camera.setZoom(clampedZoom);
  }

  private syncCanvasSize(): void {
    if (!this.canvas || !this.container || !this.ctx || !this.offscreenCanvas) return;

    const rect = this.container.getBoundingClientRect();
    this.viewportWidth = Math.max(1, Math.round(rect.width));
    this.viewportHeight = Math.max(1, Math.round(rect.height));
    this.dpr = Math.max(1, window.devicePixelRatio || 1);

    this.canvas.width = Math.max(1, Math.round(this.viewportWidth * this.dpr));
    this.canvas.height = Math.max(1, Math.round(this.viewportHeight * this.dpr));
    this.offscreenCanvas.width = this.canvas.width;
    this.offscreenCanvas.height = this.canvas.height;

    this.#setZoomConstrainedToView(this.camera.zoom);
    this.camera.clampCenterToView(this.viewRect, this.viewportWidth, this.viewportHeight);
    this.#emitZoomLevel();
  }

  #invalidate(): void {
    this.dirty = true;
    if (this.rafId !== 0) return;

    this.rafId = requestAnimationFrame(() => {
      this.rafId = 0;
      if (!this.dirty) return;
      this.dirty = false;
      this.#render();
    });
  }

  #render(): void {
    if (!this.ctx || !this.offscreenCanvas || !this.offscreenCtx) return;

    const offCtx = this.offscreenCtx;
    offCtx.setTransform(1, 0, 0, 1, 0, 0);
    offCtx.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);

    // Draw the full scene onto the offscreen canvas in CSS pixel coordinates.
    offCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    offCtx.fillStyle = "#f7f8fa";
    offCtx.fillRect(0, 0, this.viewportWidth, this.viewportHeight);

    offCtx.save();
    this.camera.applyToContext(offCtx, this.viewportWidth, this.viewportHeight);

    const visibleWorld = this.camera.getVisibleWorldRect(this.viewportWidth, this.viewportHeight);
    drawAdaptiveGrid(offCtx, visibleWorld, this.camera.zoom);
    this.#drawShapes(offCtx);

    offCtx.save();
    offCtx.strokeStyle = "rgba(37, 44, 62, 0.95)";
    offCtx.lineWidth = 2 / this.camera.zoom;
    offCtx.strokeRect(this.pageRect.x, this.pageRect.y, this.pageRect.width, this.pageRect.height);

    offCtx.strokeStyle = "rgba(37, 44, 62, 0.35)";
    offCtx.lineWidth = 1 / this.camera.zoom;
    offCtx.strokeRect(this.viewRect.x, this.viewRect.y, this.viewRect.width, this.viewRect.height);
    offCtx.restore();

    offCtx.restore();

    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas!.width, this.canvas!.height);

    // Pass 1: render the entire scene in grayscale.
    ctx.save();
    ctx.filter = "grayscale(100%) contrast(0.4)";
    ctx.drawImage(this.offscreenCanvas, 0, 0);
    ctx.restore();

    // Pass 2: render the same scene in color, clipped to the page rectangle.
    const pageTopLeft = this.camera.worldToScreen(
      { x: this.pageRect.x, y: this.pageRect.y },
      this.viewportWidth,
      this.viewportHeight,
    );
    const pageBottomRight = this.camera.worldToScreen(
      { x: this.pageRect.x + this.pageRect.width, y: this.pageRect.y + this.pageRect.height },
      this.viewportWidth,
      this.viewportHeight,
    );

    ctx.save();
    ctx.beginPath();
    ctx.rect(
      pageTopLeft.x * this.dpr,
      pageTopLeft.y * this.dpr,
      (pageBottomRight.x - pageTopLeft.x) * this.dpr,
      (pageBottomRight.y - pageTopLeft.y) * this.dpr,
    );
    ctx.clip();
    ctx.filter = "none";
    ctx.drawImage(this.offscreenCanvas, 0, 0);
    ctx.restore();
  }

  #drawShapes(ctx: CanvasRenderingContext2D): void {
    for (const elem of this.graphicElems) {
      elem.drawFn(ctx);
    }
  }

  readonly #onPointerDown = (ev: PointerEvent): void => {
    const worldPoint = this.#eventToWorldPoint(ev);
    if (worldPoint && this.handlePtrDown(worldPoint, { pointerId: ev.pointerId, clientX: ev.clientX, clientY: ev.clientY })) {
      return;
    }

    if (ev.button !== 0) return;
    this.isDragging = true;
    this.dragLast = { x: ev.clientX, y: ev.clientY };
  };

  readonly #onPointerMove = (ev: PointerEvent): void => {
    console.log("pointer move", ev.pointerId, ev.clientX, ev.clientY);
    const worldPoint = this.#eventToWorldPoint(ev);
    if (worldPoint && this.handlePtrMove(worldPoint, { pointerId: ev.pointerId, clientX: ev.clientX, clientY: ev.clientY })) {
      return;
    }

    if (!this.isDragging) return;

    const dx = ev.clientX - this.dragLast.x;
    const dy = ev.clientY - this.dragLast.y;
    this.dragLast = { x: ev.clientX, y: ev.clientY };

    this.camera.centerX -= dx / this.camera.zoom;
    this.camera.centerY -= dy / this.camera.zoom;
    this.camera.clampCenterToView(this.viewRect, this.viewportWidth, this.viewportHeight);
    this.#emitZoomLevel();
    this.#invalidate();
  };

  readonly #onPointerUp = (ev: PointerEvent): void => {
    const worldPoint = this.#eventToWorldPoint(ev);
    if (worldPoint && this.handlePtrUp(worldPoint, { pointerId: ev.pointerId, clientX: ev.clientX, clientY: ev.clientY })) {
      return;
    }

    if (!this.isDragging) return;
    this.isDragging = false;
  };

  readonly #onPointerLeave = (_ev: PointerEvent): void => {
    console.log("pointer leave");
    if (!this.isDragging) return;
    this.isDragging = false;
  };

  #eventToWorldPoint(ev: PointerEvent): Point | null {
    if (!this.canvas) return null;

    const rect = this.canvas.getBoundingClientRect();
    const viewportWidth = Math.max(1, rect.width);
    const viewportHeight = Math.max(1, rect.height);
    const screenPoint = { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
    const worldPoint = this.camera.screenToWorld(screenPoint, viewportWidth, viewportHeight);
    const pageCenterX = this.pageRect.x + this.pageRect.width / 2;
    const pageCenterY = this.pageRect.y + this.pageRect.height / 2;

    return {
      x: worldPoint.x - pageCenterX,
      y: worldPoint.y - pageCenterY,
    };
  }

  readonly #onWheel = (ev: WheelEvent): void => {
    ev.preventDefault();

    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const screenPoint = { x: ev.clientX - rect.left, y: ev.clientY - rect.top };

    const before = this.camera.screenToWorld(screenPoint, this.viewportWidth, this.viewportHeight);

    const zoomScale = Math.exp(-ev.deltaY * 0.001);
    this.#setZoomConstrainedToView(this.camera.zoom * zoomScale);

    const after = this.camera.screenToWorld(screenPoint, this.viewportWidth, this.viewportHeight);

    this.camera.centerX += before.x - after.x;
    this.camera.centerY += before.y - after.y;

    this.camera.clampCenterToView(this.viewRect, this.viewportWidth, this.viewportHeight);
    this.#emitZoomLevel();
    this.#invalidate();
  };

}
