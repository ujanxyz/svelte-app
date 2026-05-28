// Concrete Graphic Implementations
// TODO: Move these to their own files as needed for better organization.

import { GraphicBase, GraphicTypeEnums, ShapeGraphicBase } from "./GraphicBase";

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
class ImageGraphic extends GraphicBase {
  constructor(id?: string) {
    super(GraphicTypeEnums.Image, id);
  }

  public drawFn(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void {
    const { x, y, width, height, rotationDeg } = this.transform;
    const rotation = rotationDeg ?? 0;

    ctx.save();
    if (rotation) {
      const cx = x + width / 2;
      const cy = y + height / 2;
      ctx.translate(cx, cy);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-cx, -cy);
    }

    ctx.fillStyle = "#E6EEF9";
    ctx.strokeStyle = "#3A6EA5";
    ctx.lineWidth = 2;
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);

    // Simple placeholder image glyph.
    ctx.strokeStyle = "#3A6EA5";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + width * 0.12, y + height * 0.82);
    ctx.lineTo(x + width * 0.42, y + height * 0.52);
    ctx.lineTo(x + width * 0.58, y + height * 0.68);
    ctx.lineTo(x + width * 0.84, y + height * 0.36);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x + width * 0.25, y + height * 0.28, Math.max(4, Math.min(width, height) * 0.08), 0, Math.PI * 2);
    ctx.fillStyle = "#3A6EA5";
    ctx.fill();
    ctx.restore();
  }

  public hitFn(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void {
    const { x, y, width, height, rotationDeg } = this.transform;
    const rotation = rotationDeg ?? 0;
    const { hitColor } = this.hitData;

    ctx.save();
    if (rotation) {
      const cx = x + width / 2;
      const cy = y + height / 2;
      ctx.translate(cx, cy);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-cx, -cy);
    }
    ctx.fillStyle = hitColor || "#000000";
    ctx.fillRect(x, y, width, height);
    ctx.restore();
  }
}

//------------------------------------------------------------------------------
export { CircleGraphic, ImageGraphic, LineGraphic, RectGraphic, StarGraphic };