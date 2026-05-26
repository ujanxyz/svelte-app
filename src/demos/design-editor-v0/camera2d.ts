import type { Point, Rect } from "./types";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export class Camera2D {
  public centerX = 0;
  public centerY = 0;
  public zoom = 1;

  public readonly minZoom: number;
  public readonly maxZoom: number;

  public constructor(minZoom = 0.25, maxZoom = 4) {
    this.minZoom = minZoom;
    this.maxZoom = maxZoom;
  }

  public worldToScreen(point: Point, viewportWidth: number, viewportHeight: number): Point {
    return {
      x: (point.x - this.centerX) * this.zoom + viewportWidth / 2,
      y: (point.y - this.centerY) * this.zoom + viewportHeight / 2,
    };
  }

  public screenToWorld(point: Point, viewportWidth: number, viewportHeight: number): Point {
    return {
      x: (point.x - viewportWidth / 2) / this.zoom + this.centerX,
      y: (point.y - viewportHeight / 2) / this.zoom + this.centerY,
    };
  }

  public applyToContext(ctx: CanvasRenderingContext2D, viewportWidth: number, viewportHeight: number): void {
    ctx.translate(viewportWidth / 2, viewportHeight / 2);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.centerX, -this.centerY);
  }

  public setZoom(nextZoom: number): void {
    this.zoom = clamp(nextZoom, this.minZoom, this.maxZoom);
  }

  public getVisibleWorldRect(viewportWidth: number, viewportHeight: number): Rect {
    const halfW = viewportWidth / (2 * this.zoom);
    const halfH = viewportHeight / (2 * this.zoom);
    return {
      x: this.centerX - halfW,
      y: this.centerY - halfH,
      width: halfW * 2,
      height: halfH * 2,
    };
  }

  public clampCenterToView(viewRect: Rect, viewportWidth: number, viewportHeight: number): void {
    const viewHalfW = viewRect.width / 2;
    const viewHalfH = viewRect.height / 2;
    const halfWorldW = viewportWidth / (2 * this.zoom);
    const halfWorldH = viewportHeight / (2 * this.zoom);

    if (halfWorldW >= viewHalfW) {
      this.centerX = 0;
    } else {
      const minX = -viewHalfW + halfWorldW;
      const maxX = viewHalfW - halfWorldW;
      this.centerX = clamp(this.centerX, minX, maxX);
    }

    if (halfWorldH >= viewHalfH) {
      this.centerY = 0;
    } else {
      const minY = -viewHalfH + halfWorldH;
      const maxY = viewHalfH - halfWorldH;
      this.centerY = clamp(this.centerY, minY, maxY);
    }
  }
}
