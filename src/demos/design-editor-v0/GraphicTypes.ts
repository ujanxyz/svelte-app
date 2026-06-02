// Concrete Graphic Implementations
// TODO: Move these to their own files as needed for better organization.

import type { base } from "@/types/base";

import { GraphicBase, GraphicTypeEnums, ShapeGraphicBase } from "./GraphicBase";
import type { EditableBezierSegment,EditableCubicBezierPath } from "./types";

class RectGraphic extends ShapeGraphicBase {
  constructor(id?: string) {
    super(GraphicTypeEnums.Rect, id);
  }

  onDrawRotated(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void {
    super.onDrawRotated(ctx);
  }

  onHitDrawRotated(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void {
    super.onHitDrawRotated(ctx);
  }
}

//------------------------------------------------------------------------------
class CircleGraphic extends ShapeGraphicBase {

  constructor(id?: string) {
    super(GraphicTypeEnums.Circle, id);
  }

  onDrawRotated(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void {
    const { width, height } = this.transform;
    const radius = Math.min(width, height) / 2;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  onHitDrawRotated(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void {
    const { width, height } = this.transform;
    const radius = Math.min(width, height) / 2;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

//------------------------------------------------------------------------------
class LineGraphic extends ShapeGraphicBase {
  constructor(id?: string) {
    super(GraphicTypeEnums.Line, id);
  }

  protected getRotationCenter(): { x: number; y: number } {
    const { x, y } = this.transform;
    return { x, y };
  }

  onDrawRotated(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void {
    const { width } = this.transform;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(-width / 2, 0);
    ctx.lineTo(width / 2, 0);
    ctx.stroke();
  }

  onHitDrawRotated(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void {
    const { width } = this.transform;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(12, (this.style.thickness || 1) + 6);
    ctx.beginPath();
    ctx.moveTo(-width / 2, 0);
    ctx.lineTo(width / 2, 0);
    ctx.stroke();
  }
}

//------------------------------------------------------------------------------
class StarGraphic extends ShapeGraphicBase {
  private points: number = 5;

  constructor(id?: string) {
    super(GraphicTypeEnums.Star, id);
  }

  onDrawRotated(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void {
    const { width, height } = this.transform;
    const outerRadius = Math.min(width, height) / 2;
    const innerRadius = outerRadius / 2;
    ctx.beginPath();
    for (let i = 0; i < this.points * 2; i += 1) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = -Math.PI / 2 + (i * Math.PI) / this.points;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  onHitDrawRotated(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void {
    const { width, height } = this.transform;
    const outerRadius = Math.min(width, height) / 2;
    const innerRadius = outerRadius / 2;
    ctx.beginPath();
    for (let i = 0; i < this.points * 2; i += 1) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = -Math.PI / 2 + (i * Math.PI) / this.points;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

//------------------------------------------------------------------------------
class PolygonGraphic extends ShapeGraphicBase {
  private coords: base.XYPosition[] = [
    { x: 0, y: -80 },
    { x: 76, y: 40 },
    { x: -76, y: 52 },
  ];

  constructor(id?: string) {
    super(GraphicTypeEnums.Polygon, id);
  }

  protected getRotationCenter(): { x: number; y: number } {
    const { x, y } = this.transform;
    return { x, y };
  }

  public getCoords(): base.XYPosition[] {
    return this.coords.map((coord) => ({ x: coord.x, y: coord.y }));
  }

  public updateCoords(nextCoords: base.XYPosition[]): void {
    if (!Array.isArray(nextCoords) || nextCoords.length < 3) return;
    this.coords = nextCoords.map((coord) => ({
      x: Math.max(-100, Math.min(100, coord.x)),
      y: Math.max(-100, Math.min(100, coord.y)),
    }));
  }

  private normalizedToLocal(coord: base.XYPosition): { x: number; y: number } {
    const { width, height } = this.transform;
    return {
      x: (coord.x / 100) * (width / 2),
      y: (coord.y / 100) * (height / 2),
    };
  }

  onDrawRotated(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void {
    if (this.coords.length < 3) return;
    ctx.beginPath();
    this.coords.forEach((coord, index) => {
      const point = this.normalizedToLocal(coord);
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  onHitDrawRotated(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void {
    if (this.coords.length < 3) return;
    ctx.beginPath();
    this.coords.forEach((coord, index) => {
      const point = this.normalizedToLocal(coord);
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

//------------------------------------------------------------------------------
class CubicBezierShape extends ShapeGraphicBase {
  private path: EditableCubicBezierPath = {
    closed: true,
    segments: [
      { p: { x: -72, y: -18 }, c0: { x: -84, y: -42 }, c1: { x: -34, y: -58 }, type: "smooth" },
      { p: { x: 0, y: -72 }, c0: { x: -22, y: -72 }, c1: { x: 26, y: -62 }, type: "smooth" },
      { p: { x: 72, y: -10 }, c0: { x: 56, y: -40 }, c1: { x: 82, y: 20 }, type: "smooth" },
      { p: { x: 10, y: 70 }, c0: { x: 58, y: 62 }, c1: { x: -30, y: 66 }, type: "smooth" },
      { p: { x: -68, y: 24 }, c0: { x: -34, y: 44 }, c1: { x: -78, y: 2 }, type: "smooth" },
    ],
  };

  constructor(id?: string) {
    super(GraphicTypeEnums.CubicBezier, id);
  }

  public getPath(): EditableCubicBezierPath {
    return {
      closed: this.path.closed,
      segments: this.path.segments.map((segment) => ({
        p: { x: segment.p.x, y: segment.p.y },
        c0: { x: segment.c0.x, y: segment.c0.y },
        c1: { x: segment.c1.x, y: segment.c1.y },
        type: segment.type,
      })),
    };
  }

  public updatePath(nextPath: EditableCubicBezierPath): void {
    if (!nextPath || !Array.isArray(nextPath.segments) || nextPath.segments.length < 2) return;
    this.path = this.normalizePathToUnitBounds({
      closed: !!nextPath.closed,
      segments: nextPath.segments.map((segment) => this.normalizeSegment(segment)),
    });
  }

  private normalizeSegment(segment: EditableBezierSegment): EditableBezierSegment {
    const clampPoint = (point: base.XYPosition): base.XYPosition => ({
      x: Math.max(-100, Math.min(100, point.x)),
      y: Math.max(-100, Math.min(100, point.y)),
    });

    return {
      p: clampPoint(segment.p),
      c0: clampPoint(segment.c0),
      c1: clampPoint(segment.c1),
      type: segment.type,
    };
  }

  private normalizePathToUnitBounds(nextPath: EditableCubicBezierPath): EditableCubicBezierPath {
    const points = nextPath.segments.flatMap((segment) => [segment.p, segment.c0, segment.c1]);
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const halfW = Math.max(1, (maxX - minX) / 2);
    const halfH = Math.max(1, (maxY - minY) / 2);

    const normalizePoint = (point: base.XYPosition): base.XYPosition => ({
      x: Math.max(-100, Math.min(100, Math.round(((point.x - centerX) / halfW) * 100))),
      y: Math.max(-100, Math.min(100, Math.round(((point.y - centerY) / halfH) * 100))),
    });

    return {
      closed: nextPath.closed,
      segments: nextPath.segments.map((segment) => ({
        type: segment.type,
        p: normalizePoint(segment.p),
        c0: normalizePoint(segment.c0),
        c1: normalizePoint(segment.c1),
      })),
    };
  }

  private normalizedToLocal(point: base.XYPosition): base.XYPosition {
    const { width, height } = this.transform;
    return {
      x: (point.x / 100) * (width / 2),
      y: (point.y / 100) * (height / 2),
    };
  }

  private tracePath(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void {
    const segments = this.path.segments;
    if (segments.length < 2) return;

    const start = this.normalizedToLocal(segments[0].p);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);

    for (let i = 0; i < segments.length - 1; i += 1) {
      const from = segments[i];
      const to = segments[i + 1];
      const cp1 = this.normalizedToLocal(from.c1);
      const cp2 = this.normalizedToLocal(to.c0);
      const next = this.normalizedToLocal(to.p);
      ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, next.x, next.y);
    }

    if (this.path.closed) {
      const last = segments[segments.length - 1];
      const first = segments[0];
      const cp1 = this.normalizedToLocal(last.c1);
      const cp2 = this.normalizedToLocal(first.c0);
      const end = this.normalizedToLocal(first.p);
      ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
      ctx.closePath();
    }
  }

  onDrawRotated(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void {
    if (this.path.segments.length < 2) return;

    this.tracePath(ctx);
    if (this.path.closed) {
      ctx.fill();
    }
    ctx.stroke();
  }

  onHitDrawRotated(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void {
    if (this.path.segments.length < 2) return;

    this.tracePath(ctx);
    if (this.path.closed) {
      ctx.fill();
      ctx.stroke();
      return;
    }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(14, (this.style.thickness || 1) + 8);
    ctx.stroke();
  }
}

//------------------------------------------------------------------------------
class ImageGraphic extends GraphicBase {
  constructor(id?: string) {
    super(GraphicTypeEnums.Image, id);
  }

  public drawFn(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void {
    const { x, y, width, height, rotationDeg } = this.transform;
    const rotation = rotationDeg ?? 0;

    ctx.save();
    ctx.translate(x, y);
    if (rotation) {
      ctx.rotate((rotation * Math.PI) / 180);
    }

    ctx.fillStyle = "#E6EEF9";
    ctx.strokeStyle = "#3A6EA5";
    ctx.lineWidth = 2;
    ctx.fillRect(-width / 2, -height / 2, width, height);
    ctx.strokeRect(-width / 2, -height / 2, width, height);

    // Simple placeholder image glyph.
    ctx.strokeStyle = "#3A6EA5";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-width / 2 + width * 0.12, -height / 2 + height * 0.82);
    ctx.lineTo(-width / 2 + width * 0.42, -height / 2 + height * 0.52);
    ctx.lineTo(-width / 2 + width * 0.58, -height / 2 + height * 0.68);
    ctx.lineTo(-width / 2 + width * 0.84, -height / 2 + height * 0.36);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-width / 2 + width * 0.25, -height / 2 + height * 0.28, Math.max(4, Math.min(width, height) * 0.08), 0, Math.PI * 2);
    ctx.fillStyle = "#3A6EA5";
    ctx.fill();
    ctx.restore();
  }

  public hitFn(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void {
    const { x, y, width, height, rotationDeg } = this.transform;
    const rotation = rotationDeg ?? 0;
    const { hitColor } = this.hitData;

    ctx.save();
    ctx.translate(x, y);
    if (rotation) {
      ctx.rotate((rotation * Math.PI) / 180);
    }
    ctx.fillStyle = hitColor || "#000000";
    ctx.fillRect(-width / 2, -height / 2, width, height);
    ctx.restore();
  }
}

//------------------------------------------------------------------------------
export { CircleGraphic, CubicBezierShape, ImageGraphic, LineGraphic, PolygonGraphic, RectGraphic, StarGraphic };