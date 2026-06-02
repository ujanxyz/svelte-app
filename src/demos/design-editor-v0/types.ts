import type { base } from "@/types/base";

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
 *
 * IMPORTANT:
 * x and y represent the center of the shape's bounding box for all graphic types.
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

export type BezierNodeType = "cusp" | "smooth" | "sym" | "auto";

export interface BezierSegment {
  p: base.XYPosition;
  c0: base.XYPosition;
  c1: base.XYPosition;
}

export interface EditableBezierSegment extends BezierSegment {
  type: BezierNodeType;
}

export interface CubicBezierPath {
  segments: BezierSegment[];
  closed: boolean;
}

export interface EditableCubicBezierPath {
  segments: EditableBezierSegment[];
  closed: boolean;
}

export const BEZIER_NODE_TYPE_CODES: Record<BezierNodeType, "C" | "S" | "Z" | "A"> = {
  cusp: "C",
  smooth: "S",
  sym: "Z",
  auto: "A",
};

