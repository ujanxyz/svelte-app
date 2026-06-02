import type { base } from "@/types/base";

import { type GraphicBase, GraphicTypeEnums } from "./GraphicBase";
import { CircleGraphic, CubicBezierShape, ImageGraphic, LineGraphic, PolygonGraphic, RectGraphic, StarGraphic } from "./GraphicTypes";
import type { EditableBezierSegment, IDimension } from "./types";

const GRAPHIC_TYPES = [
  GraphicTypeEnums.Rect,
  GraphicTypeEnums.Circle,
  GraphicTypeEnums.Line,
  GraphicTypeEnums.Star,
  GraphicTypeEnums.Image,
  GraphicTypeEnums.Polygon,
  GraphicTypeEnums.CubicBezier,
] as const;

const NON_BEZIER_TYPES = GRAPHIC_TYPES.filter((type) => type !== GraphicTypeEnums.CubicBezier);

export type GraphicFactoryType = typeof GRAPHIC_TYPES[number];
type PolygonPreset = "triangle" | "pentagon" | "nonconvex7" | "nonconvex12";
const POLYGON_PRESETS: PolygonPreset[] = ["triangle", "pentagon", "nonconvex7", "nonconvex12"];

const PASTEL_FILLS = [
  "#F8D7DA",
  "#D7F0FA",
  "#DFF6DD",
  "#FDECC8",
  "#E8DEFF",
  "#F9E0EF",
];

const SATURATED_STROKES = [
  "#0F62FE",
  "#198038",
  "#D12771",
  "#8A3FFC",
  "#FF6F00",
  "#009D9A",
];

const SATURATED_LINE_STROKES = [
  "#0050E6",
  "#0E8A16",
  "#BA1B63",
  "#6929C4",
  "#C74F00",
  "#007D79",
];

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(values: readonly T[]): T {
  return values[randInt(0, values.length - 1)];
}

function randInRange(min: number, max: number): number {
  if (min >= max) return Math.round((min + max) / 2);
  return randInt(Math.round(min), Math.round(max));
}

function regularPolygonCoords(sides: number, radius = 90): base.XYPosition[] {
  return Array.from({ length: sides }, (_, i) => {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / sides;
    return {
      x: Math.round(Math.cos(angle) * radius),
      y: Math.round(Math.sin(angle) * radius),
    };
  });
}

function makePolygonCoords(preset: PolygonPreset): base.XYPosition[] {
  if (preset === "triangle") {
    return regularPolygonCoords(3, 92);
  }
  if (preset === "pentagon") {
    return regularPolygonCoords(5, 86);
  }
  if (preset === "nonconvex7") {
    return [
      { x: 0, y: -92 },
      { x: 38, y: -30 },
      { x: 86, y: -8 },
      { x: 34, y: 18 },
      { x: 54, y: 84 },
      { x: -8, y: 44 },
      { x: -78, y: 66 },
    ];
  }

  return [
    { x: 0, y: -96 },
    { x: 24, y: -58 },
    { x: 88, y: -70 },
    { x: 52, y: -24 },
    { x: 94, y: 8 },
    { x: 42, y: 28 },
    { x: 68, y: 92 },
    { x: 10, y: 52 },
    { x: -34, y: 96 },
    { x: -38, y: 30 },
    { x: -92, y: 12 },
    { x: -28, y: -34 },
  ];
}

/**
 * Normalizes arbitrary polygon coordinates into editor-local polygon space
 * where each axis is clamped to [-100, 100] around the polygon bounds center.
 */
function normalizeCoordsToUnitBounds(coords: base.XYPosition[]): base.XYPosition[] {
  if (!coords.length) return [];

  const xs = coords.map((coord) => coord.x);
  const ys = coords.map((coord) => coord.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const halfW = Math.max(1, (maxX - minX) / 2);
  const halfH = Math.max(1, (maxY - minY) / 2);

  return coords.map((coord) => ({
    x: Math.max(-100, Math.min(100, Math.round(((coord.x - centerX) / halfW) * 100))),
    y: Math.max(-100, Math.min(100, Math.round(((coord.y - centerY) / halfH) * 100))),
  }));
}

function makeBezierSegments(variant: number): EditableBezierSegment[] {
  if (variant % 3 === 0) {
    return [
      { p: { x: -86, y: 12 }, c0: { x: -94, y: -8 }, c1: { x: -52, y: -30 }, type: "cusp" },
      { p: { x: -20, y: -48 }, c0: { x: -46, y: -48 }, c1: { x: 4, y: -58 }, type: "smooth" },
      { p: { x: 42, y: -12 }, c0: { x: 14, y: -24 }, c1: { x: 68, y: 6 }, type: "sym" },
      { p: { x: 86, y: 44 }, c0: { x: 78, y: 22 }, c1: { x: 92, y: 60 }, type: "auto" },
    ];
  }

  if (variant % 3 === 1) {
    return [
      { p: { x: -58, y: -60 }, c0: { x: -84, y: -66 }, c1: { x: -34, y: -78 }, type: "smooth" },
      { p: { x: 8, y: -72 }, c0: { x: -14, y: -72 }, c1: { x: 34, y: -60 }, type: "smooth" },
      { p: { x: 72, y: -18 }, c0: { x: 56, y: -50 }, c1: { x: 84, y: 12 }, type: "sym" },
      { p: { x: 46, y: 64 }, c0: { x: 72, y: 52 }, c1: { x: 12, y: 82 }, type: "auto" },
      { p: { x: -42, y: 56 }, c0: { x: -2, y: 60 }, c1: { x: -72, y: 34 }, type: "cusp" },
    ];
  }

  return [
    { p: { x: -70, y: -26 }, c0: { x: -88, y: -38 }, c1: { x: -44, y: -60 }, type: "auto" },
    { p: { x: -22, y: -72 }, c0: { x: -40, y: -72 }, c1: { x: 8, y: -72 }, type: "smooth" },
    { p: { x: 48, y: -54 }, c0: { x: 22, y: -68 }, c1: { x: 72, y: -30 }, type: "sym" },
    { p: { x: 78, y: 8 }, c0: { x: 86, y: -12 }, c1: { x: 84, y: 28 }, type: "cusp" },
    { p: { x: 38, y: 68 }, c0: { x: 60, y: 54 }, c1: { x: 4, y: 78 }, type: "auto" },
    { p: { x: -38, y: 56 }, c0: { x: -4, y: 74 }, c1: { x: -72, y: 40 }, type: "smooth" },
  ];
}

function makeBezierPath(closed: boolean, variant: number): { closed: boolean; segments: EditableBezierSegment[] } {
  return {
    closed,
    segments: makeBezierSegments(variant),
  };
}

function createStyledGraphic(
  type: GraphicFactoryType,
  fill: string,
  stroke: string,
  options?: { polygonPreset?: PolygonPreset; bezierClosed?: boolean; bezierVariant?: number },
): GraphicBase {
  if (type === GraphicTypeEnums.Rect) {
    const g = new RectGraphic();
    g.updateStyle({ fill, stroke, thickness: 42 });
    return g;
  }

  if (type === GraphicTypeEnums.Circle) {
    const g = new CircleGraphic();
    g.updateStyle({ fill, stroke, thickness: 2 });
    return g;
  }

  if (type === GraphicTypeEnums.Line) {
    const g = new LineGraphic();
    g.updateStyle({ fill: stroke, stroke, thickness: 6 });
    return g;
  }

  if (type === GraphicTypeEnums.Star) {
    const g = new StarGraphic();
    g.updateStyle({ fill, stroke, thickness: 2 });
    return g;
  }

  if (type === GraphicTypeEnums.Polygon) {
    const g = new PolygonGraphic();
    g.updateStyle({ fill, stroke, thickness: 2 });
    const preset = options?.polygonPreset ?? pick(POLYGON_PRESETS);
    g.updateCoords(normalizeCoordsToUnitBounds(makePolygonCoords(preset)));
    return g;
  }

  if (type === GraphicTypeEnums.CubicBezier) {
    const g = new CubicBezierShape();
    g.updateStyle({ fill, stroke, thickness: 3 });
    g.updatePath(makeBezierPath(options?.bezierClosed ?? true, options?.bezierVariant ?? randInt(0, 2)));
    return g;
  }

  return new ImageGraphic();
}

export function createGraphic(
  type: GraphicFactoryType,
  dimension: IDimension,
  options?: { polygonPreset?: PolygonPreset; bezierClosed?: boolean; bezierVariant?: number },
): GraphicBase {
  const halfW = dimension.width / 2;
  const halfH = dimension.height / 2;

  const fill = pick(PASTEL_FILLS);
  const stroke = type === GraphicTypeEnums.Line ? pick(SATURATED_LINE_STROKES) : pick(SATURATED_STROKES);
  const graphic = createStyledGraphic(type, fill, stroke, options);

  const width = type === GraphicTypeEnums.Line ? randInt(90, 200) : randInt(70, 180);
  const height = type === GraphicTypeEnums.Line ? 0 : randInt(70, 180);
  const x = randInRange(-halfW + width / 2 + 24, halfW - width / 2 - 24);
  const y = randInRange(-halfH + height / 2 + 24, halfH - height / 2 - 24);
  const rotationDeg = type === GraphicTypeEnums.Line ? randInt(-35, 35) : randInt(-18, 18);

  graphic.updateTransform({ x, y, width, height, rotationDeg });
  graphic.updateConfig({ zIndex: 0 });
  return graphic;
}

export function createGraphicSet(count: number, dimension: IDimension): GraphicBase[] {
  const graphics: GraphicBase[] = [];

  const demoBezierConfigs = [
    { closed: false, variant: 0 },
    { closed: true, variant: 1 },
    { closed: true, variant: 2 },
  ];

  const regularCount = Math.max(0, count - Math.min(3, count));
  for (let i = 0; i < regularCount; i += 1) {
    const type = NON_BEZIER_TYPES[i % NON_BEZIER_TYPES.length];
    const graphic = createGraphic(type, dimension);
    graphic.updateConfig({ zIndex: i });
    graphics.push(graphic);
  }

  for (let i = 0; i < demoBezierConfigs.length && graphics.length < count; i += 1) {
    const cfg = demoBezierConfigs[i];
    const graphic = createGraphic(GraphicTypeEnums.CubicBezier, dimension, {
      bezierClosed: cfg.closed,
      bezierVariant: cfg.variant,
    });
    graphic.updateConfig({ zIndex: graphics.length });
    graphics.push(graphic);
  }

  for (let i = graphics.length; i < count; i += 1) {
    const type = GRAPHIC_TYPES[i % GRAPHIC_TYPES.length];
    const graphic = createGraphic(type, dimension);
    graphic.updateConfig({ zIndex: i });
    graphics.push(graphic);
  }

  return graphics;
}

export const createGrapicSet = createGraphicSet;
