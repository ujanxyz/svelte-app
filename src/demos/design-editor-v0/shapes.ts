import type { RotatedRect, ShapeType } from "./types";

export const HIT_BORDER = 5;
export const LINE_HIT_BORDER = 20;

abstract class BaseShape {
  public readonly id: string;
  public readonly type: ShapeType;
  public fill: string;
  public stroke: string;
  public zIndex: number;
  public hitId: number;
  public hitColor: string;

  protected constructor(
    id: string,
    type: ShapeType,
    fill: string,
    stroke: string,
    zIndex: number,
    hitId = -1,
    hitColor = "#000000",
  ) {
    this.id = id;
    this.type = type;
    this.fill = fill;
    this.stroke = stroke;
    this.zIndex = zIndex;
    this.hitId = hitId;
    this.hitColor = hitColor;
  }

  abstract draw(ctx: CanvasRenderingContext2D): void;
  abstract drawHit(ctx: CanvasRenderingContext2D): void;
  abstract getBounds(): RotatedRect;
}

export class RectShape extends BaseShape {
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  public constructor(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    fill: string,
    stroke = "#1f2937",
    zIndex = 0,
    hitId = -1,
    hitColor = "#000000",
  ) {
    super(id, "rect", fill, stroke, zIndex, hitId, hitColor);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.fill;
    ctx.strokeStyle = this.stroke;
    ctx.lineWidth = 2;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }

  drawHit(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = this.hitColor;
    const pad = HIT_BORDER / 2;
    ctx.fillRect(this.x - pad, this.y - pad, this.width + HIT_BORDER, this.height + HIT_BORDER);
    ctx.restore();
  }

  getBounds(): RotatedRect {
    return { x: this.x, y: this.y, width: this.width, height: this.height, rotationDeg: 0 };
  }
}

export class CircleShape extends BaseShape {
  public cx: number;
  public cy: number;
  public radius: number;

  public constructor(
    id: string,
    cx: number,
    cy: number,
    radius: number,
    fill: string,
    stroke = "#1f2937",
    zIndex = 0,
    hitId = -1,
    hitColor = "#000000",
  ) {
    super(id, "circle", fill, stroke, zIndex, hitId, hitColor);
    this.cx = cx;
    this.cy = cy;
    this.radius = radius;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, this.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = this.fill;
    ctx.strokeStyle = this.stroke;
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
  }

  drawHit(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, this.radius + HIT_BORDER / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = this.hitColor;
    ctx.fill();
    ctx.restore();
  }

  getBounds(): RotatedRect {
    return {
      x: this.cx - this.radius,
      y: this.cy - this.radius,
      width: this.radius * 2,
      height: this.radius * 2,
      rotationDeg: 0,
    };
  }
}

export class LineShape extends BaseShape {
  public x1: number;
  public y1: number;
  public x2: number;
  public y2: number;

  public constructor(
    id: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    stroke: string,
    zIndex = 0,
    hitId = -1,
    hitColor = "#000000",
  ) {
    super(id, "line", stroke, stroke, zIndex, hitId, hitColor);
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.x1, this.y1);
    ctx.lineTo(this.x2, this.y2);
    ctx.strokeStyle = this.stroke;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.restore();
  }

  drawHit(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.x1, this.y1);
    ctx.lineTo(this.x2, this.y2);
    ctx.strokeStyle = this.hitColor;
    ctx.lineWidth = LINE_HIT_BORDER;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.restore();
  }

  getBounds(): RotatedRect {
    const minX = Math.min(this.x1, this.x2);
    const minY = Math.min(this.y1, this.y2);
    const maxX = Math.max(this.x1, this.x2);
    const maxY = Math.max(this.y1, this.y2);
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      rotationDeg: (Math.atan2(this.y2 - this.y1, this.x2 - this.x1) * 180) / Math.PI,
    };
  }
}

export class StarShape extends BaseShape {
  public cx: number;
  public cy: number;
  public n: number;
  public rin: number;
  public rout: number;

  public constructor(
    id: string,
    cx: number,
    cy: number,
    n: number,
    rin: number,
    rout: number,
    fill: string,
    stroke = "#1f2937",
    zIndex = 0,
    hitId = -1,
    hitColor = "#000000",
  ) {
    super(id, "star", fill, stroke, zIndex, hitId, hitColor);
    this.cx = cx;
    this.cy = cy;
    this.n = Math.max(3, Math.floor(n));
    this.rin = rin;
    this.rout = rout;
  }

  private tracePath(ctx: CanvasRenderingContext2D, radiusPad = 0): void {
    const points = this.n * 2;
    const start = -Math.PI / 2;
    ctx.beginPath();
    for (let i = 0; i < points; i += 1) {
      const radius = i % 2 === 0 ? this.rout + radiusPad : Math.max(0, this.rin + radiusPad);
      const angle = start + (i * Math.PI) / this.n;
      const x = this.cx + Math.cos(angle) * radius;
      const y = this.cy + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    this.tracePath(ctx);
    ctx.fillStyle = this.fill;
    ctx.strokeStyle = this.stroke;
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  drawHit(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    this.tracePath(ctx, HIT_BORDER / 2);
    ctx.fillStyle = this.hitColor;
    ctx.fill();
    ctx.restore();
  }

  getBounds(): RotatedRect {
    return {
      x: this.cx - this.rout,
      y: this.cy - this.rout,
      width: this.rout * 2,
      height: this.rout * 2,
      rotationDeg: 0,
    };
  }
}

export type DemoShape = RectShape | CircleShape | LineShape | StarShape;

export function createDemoShapes(pageWidth = 600, pageHeight = 400): DemoShape[] {
  const halfW = pageWidth / 2;
  const halfH = pageHeight / 2;

  return [
    new CircleShape("c-1", -halfW + 80, -halfH + 70, 40, "#fd6a6a", "#7f1d1d", 1),
    new CircleShape("c-2", -40, -20, 65, "#3f96ff", "#1e3a8a", 2),
    new CircleShape("c-3", halfW - 60, halfH - 40, 48, "#32b87f", "#14532d", 3),
    new RectShape("r-1", -halfW + 20, halfH - 120, 140, 80, "#ff7f50", "#7c2d12", 2),
    new RectShape("r-2", 120, -halfH + 30, 110, 130, "#00a896", "#134e4a", 2),
    new RectShape("r-3", -150, 90, 180, 70, "#4361ee", "#312e81", 1),
    new LineShape("l-1", -halfW + 30, -30, -halfW + 220, 70, "#0f766e", 2),
    new LineShape("l-2", halfW - 200, -halfH + 20, halfW - 20, -halfH + 130, "#b45309", 1),
    new StarShape("s-1", halfW - 120, halfH - 90, 5, 22, 45, "#f97316", "#7c2d12", 2),
    new StarShape("s-2", -halfW + 120, halfH - 50, 7, 18, 42, "#22c55e", "#14532d", 1),
  ];
}
