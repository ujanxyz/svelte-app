import type { Rect } from "./types";

const GRID_AXIS_COLOR = "#525F7FE6";
const GRID_MAJOR_COLOR = "#7885A073";
const GRID_MINOR_COLOR = "#7885A033";

function _chooseGridStep(zoom: number): number {
  const targetPixelSpacing = 32;
  const targetWorld = targetPixelSpacing / zoom;
  const power = 10 ** Math.floor(Math.log10(Math.max(targetWorld, 1e-6)));
  const normalized = targetWorld / power;

  let snapped = 1;
  if (normalized <= 1) snapped = 1;
  else if (normalized <= 2) snapped = 2;
  else if (normalized <= 5) snapped = 5;
  else snapped = 10;

  return snapped * power;
}

export function drawAdaptiveGrid(
  ctx: CanvasRenderingContext2D,
  visibleWorld: Rect,
  zoom: number,
): void {
  const step = _chooseGridStep(zoom);
  const majorStep = step * 5;

  const xStart = Math.floor(visibleWorld.x / step) * step;
  const xEnd = visibleWorld.x + visibleWorld.width;
  const yStart = Math.floor(visibleWorld.y / step) * step;
  const yEnd = visibleWorld.y + visibleWorld.height;

  const minorLineWidth = 1 / zoom;
  const majorLineWidth = 1.4 / zoom;
  const axisLineWidth = 2.2 / zoom;

  for (let x = xStart; x <= xEnd; x += step) {
    const isAxis = Math.abs(x) < step * 0.25;
    const isMajor = Math.abs((x / majorStep) - Math.round(x / majorStep)) < 1e-6;

    ctx.beginPath();
    ctx.moveTo(x, yStart);
    ctx.lineTo(x, yEnd);

    if (isAxis) {
      ctx.strokeStyle = GRID_AXIS_COLOR;
      ctx.lineWidth = axisLineWidth;
    } else if (isMajor) {
      ctx.strokeStyle = GRID_MAJOR_COLOR;
      ctx.lineWidth = majorLineWidth;
    } else {
      ctx.strokeStyle = GRID_MINOR_COLOR;
      ctx.lineWidth = minorLineWidth;
    }
    ctx.stroke();
  }

  for (let y = yStart; y <= yEnd; y += step) {
    const isAxis = Math.abs(y) < step * 0.25;
    const isMajor = Math.abs((y / majorStep) - Math.round(y / majorStep)) < 1e-6;

    ctx.beginPath();
    ctx.moveTo(xStart, y);
    ctx.lineTo(xEnd, y);

    if (isAxis) {
      ctx.strokeStyle = GRID_AXIS_COLOR;
      ctx.lineWidth = axisLineWidth;
    } else if (isMajor) {
      ctx.strokeStyle = GRID_MAJOR_COLOR;
      ctx.lineWidth = majorLineWidth;
    } else {
      ctx.strokeStyle = GRID_MINOR_COLOR;
      ctx.lineWidth = minorLineWidth;
    }
    ctx.stroke();
  }
}
