import type { HitCandidate, RotatedRect } from "./types";

const DEFAULT_HIT_COLOR = "#000000FF";

const GraphicTypeEnums = Object.freeze({
  // Shape graphics.
  Rect: "rect",
  Circle: "circle",
  Line: "line",
  Star: "star",
  // Non shape graphics.
  Image: "image",
  Group: "group",
});

type GraphicType = typeof GraphicTypeEnums[keyof typeof GraphicTypeEnums];

export interface DrawStyle {
  opacity: number;
  fill: string;
  stroke: string;
  thickness: number;
}

interface GraphicConfig {
  zIndex: number;
  visible: boolean;
  locked: boolean;
}

function clampOpacity(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function applyDrawStyle(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, style: DrawStyle): void {
  ctx.globalAlpha = clampOpacity(style.opacity);
  ctx.strokeStyle = style.stroke;
  ctx.fillStyle = style.fill;
  ctx.lineWidth = Math.max(1, style.thickness || 1);
}

const ERR_NOT_IN_BASE = "This should be implemented by subclasses.";

class GraphicBase {
  public readonly type: GraphicType;
  public readonly elemId: string;

  protected readonly hitData: HitCandidate;
  protected readonly config: GraphicConfig;
  protected transform: RotatedRect;

  public constructor(type: GraphicType, id?: string) {
    this.type = type;
    this.elemId = id ?? crypto.randomUUID();
    this.hitData = { hitId: 0, hitColor: "#000000" };
    this.transform = { x: 0, y: 0, width: 0, height: 0, rotationDeg: 0 };
    this.config = { zIndex: 0, visible: true, locked: false };
  }

  public get id(): string {
    return this.elemId;
  }

  public updateConfig(config: Partial<GraphicConfig>): void {
    Object.assign(this.config, config);
  }

  // TODO: Replace applyFrameTransformToElement with this.
  public updateTransform(delta: Partial<RotatedRect>): void {
    Object.assign(this.transform, delta);
  }

  public setHitData(hitId: number, hitColor: string): void {
    this.hitData.hitId = hitId;
    this.hitData.hitColor = hitColor;
  }

  public getTransform(): RotatedRect {
    return { ...this.transform };
  }

  public getHitData(): HitCandidate {
    return { ...this.hitData };
  }

  public getZIndex(): number {
    return this.config.zIndex;
  }

  public getConfig(): { zIndex: number; visible: boolean; locked: boolean } {
    return { ...this.config };
  }

  // Main draw function for this graphic. This will be called by the editor's rendering loop.
  drawFn(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void {
    throw new Error(ERR_NOT_IN_BASE);
  }

  // Hit testing implementation for this graphic. This will be called by the editor's hit
  // testing logic.
  hitFn(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void {
    throw new Error(ERR_NOT_IN_BASE);
  }
}

//------------------------------------------------------------------------------
class ShapeGraphicBase extends GraphicBase {
  protected readonly style: DrawStyle;

  constructor(type: GraphicType, id?: string) {
    super(type, id);
    this.style = { opacity: 1, fill: "#000000", stroke: "#000000", thickness: 1 };
  }

  public updateStyle(style: Partial<DrawStyle>): void {
    Object.assign(this.style, style);
  }

  public getStyle(): DrawStyle {
    return { ...this.style };
  }

  protected getRotationCenter(): { x: number; y: number } {
    const { x, y, width, height } = this.transform;
    return { x: x + width / 2, y: y + height / 2 };
  }

  // Main draw function for this graphic. This will be called by the editor's rendering loop.
  drawFn(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void {
    if (!this.config.visible) return;
    const { rotationDeg } = this.transform;
    const rotation = rotationDeg ?? 0;
    const center = this.getRotationCenter();

    ctx.save();
    applyDrawStyle(ctx, this.style);
    ctx.translate(center.x, center.y);
    if (rotation) {
      ctx.rotate((rotation * Math.PI) / 180);
    }
    // Subclasses should implement this draw handler for the specific graphic.
    this.onDrawRotated(ctx);
    ctx.restore();
  }

  // Hit testing implementation for this graphic. This will be called by the editor's hit
  // testing logic.
  hitFn(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void {
    if (!this.config.visible) return;
    const { rotationDeg } = this.transform;
    const rotation = rotationDeg ?? 0;
    const center = this.getRotationCenter();
    const { hitColor } = this.hitData;

    ctx.save();
    ctx.fillStyle = hitColor || DEFAULT_HIT_COLOR;
    ctx.strokeStyle = hitColor || DEFAULT_HIT_COLOR;
    ctx.lineWidth = Math.max(1, this.style.thickness || 1);
    ctx.translate(center.x, center.y);
    if (rotation) {
      ctx.rotate((rotation * Math.PI) / 180);
    }
    this.onHitDrawRotated(ctx);

    ctx.restore();
  }

  // Hook to handle draw for the specific graphic types.
  // This default implementation is for generic rect.
  protected onDrawRotated(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void {
    const { width, height } = this.transform;
    ctx.fillRect(-width / 2, -height / 2, width, height);
    ctx.strokeRect(-width / 2, -height / 2, width, height);
  }

  // Hook to handle drawing on hit canvas for the specific graphic types.
  // This default implementation is for generic rect.
  protected onHitDrawRotated(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void {
    const { width, height } = this.transform;
    ctx.fillRect(-width / 2, -height / 2, width, height);
    ctx.strokeRect(-width / 2, -height / 2, width, height);
  }
}


export { GraphicBase, GraphicTypeEnums, ShapeGraphicBase };