import { type GraphicBase,GraphicTypeEnums } from "./GraphicBase";
import { CircleGraphic, ImageGraphic, LineGraphic, RectGraphic, StarGraphic } from "./GraphicTypes";
import type { IDimension } from "./types";

const GRAPHIC_TYPES = [
  GraphicTypeEnums.Rect,
  GraphicTypeEnums.Circle,
  GraphicTypeEnums.Line,
  GraphicTypeEnums.Star,
  GraphicTypeEnums.Image,
] as const;

export type GraphicFactoryType = typeof GRAPHIC_TYPES[number];

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

export function createGraphic(type: GraphicFactoryType, dimension: IDimension): GraphicBase {
  const halfW = dimension.width / 2;
  const halfH = dimension.height / 2;

  const fill = pick(PASTEL_FILLS);
  const stroke = type === GraphicTypeEnums.Line ? pick(SATURATED_LINE_STROKES) : pick(SATURATED_STROKES);

  let graphic: GraphicBase;
  if (type === GraphicTypeEnums.Rect) {
    const g = new RectGraphic();
    g.updateStyle({ fill, stroke, thickness: 42 });
    graphic = g;
  } else if (type === GraphicTypeEnums.Circle) {
    const g = new CircleGraphic();
    g.updateStyle({ fill, stroke, thickness: 2 });
    graphic = g;
  } else if (type === GraphicTypeEnums.Line) {
    const g = new LineGraphic();
    g.updateStyle({ fill: stroke, stroke, thickness: 6 });
    graphic = g;
  } else if (type === GraphicTypeEnums.Star) {
    const g = new StarGraphic();
    g.updateStyle({ fill, stroke, thickness: 2 });
    graphic = g;
  } else {
    graphic = new ImageGraphic();
  }

  const width = type === GraphicTypeEnums.Line ? randInt(90, 200) : randInt(70, 180);
  const height = type === GraphicTypeEnums.Line ? 0 : randInt(70, 180);
  const x = randInt(Math.round(-halfW + 24), Math.round(halfW - width - 24));
  const y = randInt(Math.round(-halfH + 24), Math.round(halfH - height - 24));
  const rotationDeg = type === GraphicTypeEnums.Line ? randInt(-35, 35) : randInt(-18, 18);

  graphic.updateTransform({ x, y, width, height, rotationDeg });
  graphic.updateConfig({ zIndex: 0 });
  return graphic;
}

export function createGraphicSet(count: number, dimension: IDimension): GraphicBase[] {
  const graphics: GraphicBase[] = [];

  for (let i = 0; i < count; i += 1) {
    const type = GRAPHIC_TYPES[i % GRAPHIC_TYPES.length];
    const graphic = createGraphic(type, dimension);
    graphic.updateConfig({ zIndex: i });
    graphics.push(graphic);
  }

  return graphics;
}

export const createGrapicSet = createGraphicSet;
