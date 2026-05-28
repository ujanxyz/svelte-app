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

export type RotatedRectDelta = Partial<RotatedRect>;
export type LineTransformDelta = Partial<LineTransform>;

export interface HitCandidate {
  hitId: number;
  hitColor: string;
}

export type AlignMode = "left" | "center" | "right" | "top" | "middle" | "bottom";

export type DistributionDirection = "horizontal" | "vertical";

