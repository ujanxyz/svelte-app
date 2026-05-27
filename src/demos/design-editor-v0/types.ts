export interface Point {
  x: number;
  y: number;
}

export interface IDimension {
  width: number;
  height: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Relative transform payload used for batch updates.
 */
export interface RotatedRect {
  x: number;
  y: number;
  width: number;
  height: number;
  rotationDeg: number;
}

export type LineTransform = RotatedRect;

export type RotatedrectDelta = Partial<RotatedRect>;
export type LineTransformDelta = Partial<LineTransform>;


export interface HitCandidate {
  hitId: number;
  hitColor: string;
}

export type ShapeType = "rect" | "circle" | "line" | "star";

export type ElementType = ShapeType | "image" | "group";

/**
 * Base properties shared by all editor elements.
 */
export interface BaseElement {
  id: string;
  type: ElementType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  fill: string;
  stroke: string;
  strokeWidth: number;
  parentId?: string;
}

export type AlignMode = "left" | "center" | "right" | "top" | "middle" | "bottom";

export type DistributionDirection = "horizontal" | "vertical";

export type GroupElementType = "group";

type DrawFn = (ctx: CanvasRenderingContext2D) => void;
type DrawHitFn = (ctx: CanvasRenderingContext2D) => void;
type BoundsFn = () => RotatedRect;

/**
 * CanvasElement is the normalized, renderable data model used by ElementStore.
 */
export interface CanvasElement extends BaseElement, HitCandidate {
  zIndex: number;
  draw: DrawFn;
  drawHit: DrawHitFn;
  getBounds: BoundsFn;

  // Optional geometry extensions used by specific element kinds.
  radius?: number;
  points?: number;
  innerRadius?: number;
  outerRadius?: number;
  source?: string;
  childIds?: string[];
}
