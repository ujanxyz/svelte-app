<script lang="ts">
import type { base } from "@/types/base";

import { drawAdaptiveGrid } from "./AdaptiveGrid";
import type {
  BezierNodeType,
  EditableBezierSegment,
  EditableCubicBezierPath,
  IDimension,
} from "./types";
import { BEZIER_NODE_TYPE_CODES } from "./types";

type Props = {
  shapeType: string;
  path: EditableCubicBezierPath;
  viewDimension: IDimension;
  zoomLevel: base.ZoomLevel;
  onclose?: () => void;
  onpathchange?: (path: EditableCubicBezierPath) => void;
};

const {
  shapeType,
  path,
  viewDimension,
  zoomLevel,
  onclose,
  onpathchange,
}: Props = $props();

const DEBUG_BEZIER_EDITOR = true;
const EDITOR_WORLD_MIN = -120;
const EDITOR_WORLD_MAX = 120;
const EDITOR_WORLD_SIZE = EDITOR_WORLD_MAX - EDITOR_WORLD_MIN;
const CAMERA_MIN_ZOOM = 0.35;
const CAMERA_MAX_ZOOM = 6;

let localPath = $state<EditableCubicBezierPath>({ segments: [], closed: false });
let gridCanvas = $state<HTMLCanvasElement | null>(null);
let editorSurfaceEl = $state<HTMLDivElement | null>(null);
let svgEl = $state<SVGSVGElement | null>(null);
let surfaceDimension = $state<IDimension>({ width: 0, height: 0 });
let lastIncomingPathKey = "";
let debugSyncCount = 0;
let debugRedrawCount = 0;
let debugEmitCount = 0;
let camera = $state.raw({
  x: 0,
  y: 0,
  zoom: 1,
  pan: null as null | {
    pointerId: number;
    lastClientX: number;
    lastClientY: number;
  },
});
let ui = $state.raw<{
  selectedIndex: number;
  preferredType: BezierNodeType;
  drag: null | {
    kind: "anchor" | "c0" | "c1";
    index: number;
    pointerId: number;
    startPoint: base.XYPosition;
    startPath: EditableCubicBezierPath;
    moved: boolean;
  };
  suppressNodeClick: boolean;
}>({
  selectedIndex: 0,
  preferredType: "smooth",
  drag: null,
  suppressNodeClick: false,
});

const selectedSegment = $derived(localPath.segments[ui.selectedIndex] ?? null);
const selectedType = $derived<BezierNodeType>(selectedSegment?.type ?? ui.preferredType);
const nodeTypesString = $derived(localPath.segments.map((segment) => BEZIER_NODE_TYPE_CODES[segment.type]).join(""));
const renderDimension = $derived.by<IDimension>(() => {
  if (surfaceDimension.width > 0 && surfaceDimension.height > 0) {
    return surfaceDimension;
  }
  return viewDimension;
});
const editorScale = $derived(Math.max(1e-6, Math.min(renderDimension.width, renderDimension.height) / EDITOR_WORLD_SIZE));
const worldScale = $derived(editorScale * camera.zoom);
const visibleWorld = $derived({
  x: camera.x - renderDimension.width / (2 * Math.max(worldScale, 1e-6)),
  y: camera.y - renderDimension.height / (2 * Math.max(worldScale, 1e-6)),
  width: renderDimension.width / Math.max(worldScale, 1e-6),
  height: renderDimension.height / Math.max(worldScale, 1e-6),
});
const pathD = $derived(buildSvgPath(localPath));

$effect(() => {
  const surface = editorSurfaceEl;
  if (!surface) return;

  const syncSurfaceSize = (): void => {
    const rect = surface.getBoundingClientRect();
    surfaceDimension = {
      width: Math.max(1, Math.round(rect.width)),
      height: Math.max(1, Math.round(rect.height)),
    };
  };

  const ro = new ResizeObserver(() => {
    syncSurfaceSize();
  });

  syncSurfaceSize();
  ro.observe(surface);

  return () => {
    ro.disconnect();
  };
});

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clampCameraCenter(nextX: number, nextY: number, nextZoom = camera.zoom): { x: number; y: number } {
  const nextWorldScale = Math.max(1e-6, editorScale * nextZoom);
  const halfVisibleW = renderDimension.width / (2 * nextWorldScale);
  const halfVisibleH = renderDimension.height / (2 * nextWorldScale);

  const minCenterX = EDITOR_WORLD_MIN + halfVisibleW;
  const maxCenterX = EDITOR_WORLD_MAX - halfVisibleW;
  const minCenterY = EDITOR_WORLD_MIN + halfVisibleH;
  const maxCenterY = EDITOR_WORLD_MAX - halfVisibleH;

  return {
    x: minCenterX <= maxCenterX ? clamp(nextX, minCenterX, maxCenterX) : 0,
    y: minCenterY <= maxCenterY ? clamp(nextY, minCenterY, maxCenterY) : 0,
  };
}

function screenToWorld(screenX: number, screenY: number): base.XYPosition {
  const scale = Math.max(worldScale, 1e-6);
  return {
    x: (screenX - renderDimension.width / 2) / scale + camera.x,
    y: (screenY - renderDimension.height / 2) / scale + camera.y,
  };
}

function pathKey(nextPath: EditableCubicBezierPath): string {
  const encodedSegments = nextPath.segments.map((segment) => {
    return `${segment.type}:${segment.p.x},${segment.p.y}|${segment.c0.x},${segment.c0.y}|${segment.c1.x},${segment.c1.y}`;
  }).join(";");
  return `${nextPath.closed ? 1 : 0}::${encodedSegments}`;
}

$effect(() => {
  const incomingPathKey = pathKey(path);
  if (incomingPathKey === lastIncomingPathKey) {
    return;
  }

  lastIncomingPathKey = incomingPathKey;
  debugSyncCount += 1;

  if (DEBUG_BEZIER_EDITOR) {
    console.debug("[CubicBezierEditor] sync from props", {
      syncCount: debugSyncCount,
      segments: path.segments.length,
      closed: path.closed,
    });
  }

  const nextLocalPath = normalizePathToUnitBounds(clonePath(path));
  localPath = nextLocalPath;
  if (nextLocalPath.segments.length === 0) {
    if (ui.selectedIndex !== 0) {
      ui = { ...ui, selectedIndex: 0 };
    }
    return;
  }

  const nextIndex = Math.max(0, Math.min(ui.selectedIndex, nextLocalPath.segments.length - 1));
  const nextPreferredType = nextLocalPath.segments[nextIndex]?.type ?? ui.preferredType;
  if (ui.selectedIndex !== nextIndex || ui.preferredType !== nextPreferredType) {
    ui = {
      ...ui,
      selectedIndex: nextIndex,
      preferredType: nextPreferredType,
    };
  }
});

$effect(() => {
  debugRedrawCount += 1;
  if (DEBUG_BEZIER_EDITOR && debugRedrawCount <= 6) {
    console.debug("[CubicBezierEditor] redraw grid", {
      redrawCount: debugRedrawCount,
      viewDimension,
      zoomLevel,
    });
  }
  redrawGrid();
});

function clonePath(nextPath: EditableCubicBezierPath): EditableCubicBezierPath {
  return {
    closed: !!nextPath.closed,
    segments: nextPath.segments.map((segment) => ({
      type: segment.type,
      p: { x: segment.p.x, y: segment.p.y },
      c0: { x: segment.c0.x, y: segment.c0.y },
      c1: { x: segment.c1.x, y: segment.c1.y },
    })),
  };
}

function normalizePathToUnitBounds(nextPath: EditableCubicBezierPath): EditableCubicBezierPath {
  if (!nextPath.segments.length) return clonePath(nextPath);

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
    closed: !!nextPath.closed,
    segments: nextPath.segments.map((segment) => ({
      type: segment.type,
      p: normalizePoint(segment.p),
      c0: normalizePoint(segment.c0),
      c1: normalizePoint(segment.c1),
    })),
  };
}

function clampPoint(point: base.XYPosition): base.XYPosition {
  return {
    x: Math.max(-100, Math.min(100, point.x)),
    y: Math.max(-100, Math.min(100, point.y)),
  };
}

function add(a: base.XYPosition, b: base.XYPosition): base.XYPosition {
  return { x: a.x + b.x, y: a.y + b.y };
}

function sub(a: base.XYPosition, b: base.XYPosition): base.XYPosition {
  return { x: a.x - b.x, y: a.y - b.y };
}

function scale(a: base.XYPosition, s: number): base.XYPosition {
  return { x: a.x * s, y: a.y * s };
}

function length(a: base.XYPosition): number {
  return Math.hypot(a.x, a.y);
}

function normalize(a: base.XYPosition): base.XYPosition {
  const len = length(a);
  if (len <= 1e-6) return { x: 1, y: 0 };
  return { x: a.x / len, y: a.y / len };
}

function distance(a: base.XYPosition, b: base.XYPosition): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function lerp(a: base.XYPosition, b: base.XYPosition, t: number): base.XYPosition {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function toWorld(ev: PointerEvent): base.XYPosition {
  if (!svgEl) return { x: 0, y: 0 };
  const rect = svgEl.getBoundingClientRect();
  const sx = ev.clientX - rect.left;
  const sy = ev.clientY - rect.top;
  return screenToWorld(sx, sy);
}

function emitPath(nextPath: EditableCubicBezierPath): void {
  const normalizedPath = normalizePathToUnitBounds(nextPath);
  debugEmitCount += 1;
  if (DEBUG_BEZIER_EDITOR) {
    console.debug("[CubicBezierEditor] emit path", {
      emitCount: debugEmitCount,
      segments: normalizedPath.segments.length,
      closed: normalizedPath.closed,
    });
  }
  onpathchange?.(clonePath(normalizedPath));
}

function redrawGrid(): void {
  if (!gridCanvas) return;
  const ctx = gridCanvas.getContext("2d");
  if (!ctx) return;

  gridCanvas.width = Math.max(1, Math.round(renderDimension.width));
  gridCanvas.height = Math.max(1, Math.round(renderDimension.height));

  ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
  ctx.save();
  ctx.translate(renderDimension.width / 2, renderDimension.height / 2);
  ctx.scale(worldScale, worldScale);
  ctx.translate(-camera.x, -camera.y);
  drawAdaptiveGrid(ctx, visibleWorld, worldScale);
  ctx.restore();
}

function beginPan(ev: PointerEvent): void {
  if (!svgEl || ui.drag) return;
  if (!(ev.button === 1 || (ev.button === 0 && ev.target === svgEl))) return;

  ev.preventDefault();
  svgEl.setPointerCapture(ev.pointerId);
  camera = {
    ...camera,
    pan: {
      pointerId: ev.pointerId,
      lastClientX: ev.clientX,
      lastClientY: ev.clientY,
    },
  };
}

function onPanPointerMove(ev: PointerEvent): void {
  if (!camera.pan || ev.pointerId !== camera.pan.pointerId) return;

  const dx = ev.clientX - camera.pan.lastClientX;
  const dy = ev.clientY - camera.pan.lastClientY;
  const scale = Math.max(worldScale, 1e-6);
  const next = clampCameraCenter(camera.x - dx / scale, camera.y - dy / scale);
  camera = {
    ...camera,
    x: next.x,
    y: next.y,
    pan: {
      ...camera.pan,
      lastClientX: ev.clientX,
      lastClientY: ev.clientY,
    },
  };
}

function endPan(ev: PointerEvent): void {
  if (!camera.pan || ev.pointerId !== camera.pan.pointerId) return;
  if (svgEl?.hasPointerCapture(ev.pointerId)) {
    svgEl.releasePointerCapture(ev.pointerId);
  }
  camera = {
    ...camera,
    pan: null,
  };
}

function onEditorPointerMove(ev: PointerEvent): void {
  onPanPointerMove(ev);
  onPointerMove(ev);
}

function onEditorPointerUp(ev: PointerEvent): void {
  endPan(ev);
  endDrag(ev);
}

function onEditorPointerCancel(ev: PointerEvent): void {
  endPan(ev);
  endDrag(ev);
}

function onWheel(ev: WheelEvent): void {
  if (!svgEl) return;
  ev.preventDefault();

  const rect = svgEl.getBoundingClientRect();
  const sx = ev.clientX - rect.left;
  const sy = ev.clientY - rect.top;
  const before = screenToWorld(sx, sy);

  const zoomScale = Math.exp(-ev.deltaY * 0.001);
  const nextZoom = clamp(camera.zoom * zoomScale, CAMERA_MIN_ZOOM, CAMERA_MAX_ZOOM);
  if (Math.abs(nextZoom - camera.zoom) < 1e-6) return;

  const nextWorldScale = Math.max(1e-6, editorScale * nextZoom);
  const worldAfter = {
    x: (sx - renderDimension.width / 2) / nextWorldScale + camera.x,
    y: (sy - renderDimension.height / 2) / nextWorldScale + camera.y,
  };

  const shiftedCenter = {
    x: camera.x + (before.x - worldAfter.x),
    y: camera.y + (before.y - worldAfter.y),
  };
  const clampedCenter = clampCameraCenter(shiftedCenter.x, shiftedCenter.y, nextZoom);
  camera = {
    ...camera,
    zoom: nextZoom,
    x: clampedCenter.x,
    y: clampedCenter.y,
  };
}

function buildSvgPath(nextPath: EditableCubicBezierPath): string {
  const segments = nextPath.segments;
  if (segments.length < 2) return "";

  let d = `M ${segments[0].p.x} ${segments[0].p.y}`;
  for (let i = 0; i < segments.length - 1; i += 1) {
    const from = segments[i];
    const to = segments[i + 1];
    d += ` C ${from.c1.x} ${from.c1.y}, ${to.c0.x} ${to.c0.y}, ${to.p.x} ${to.p.y}`;
  }

  if (nextPath.closed) {
    const last = segments[segments.length - 1];
    const first = segments[0];
    d += ` C ${last.c1.x} ${last.c1.y}, ${first.c0.x} ${first.c0.y}, ${first.p.x} ${first.p.y} Z`;
  }

  return d;
}

function enforceTypeConstraint(nextPath: EditableCubicBezierPath, index: number, movedHandle: "c0" | "c1", sourcePath?: EditableCubicBezierPath): void {
  const segment = nextPath.segments[index];
  if (!segment || segment.type === "cusp") return;

  const oppositeHandle = movedHandle === "c0" ? "c1" : "c0";
  const movedVector = sub(segment[movedHandle], segment.p);

  if (segment.type === "sym" || segment.type === "auto") {
    segment[oppositeHandle] = clampPoint(add(segment.p, scale(movedVector, -1)));
    return;
  }

  const baseOpposite = sourcePath?.segments[index]?.[oppositeHandle] ?? segment[oppositeHandle];
  const oppositeLength = Math.max(1, distance(baseOpposite, segment.p));
  const direction = normalize(movedVector);
  segment[oppositeHandle] = clampPoint(add(segment.p, scale(direction, -oppositeLength)));
}

function recomputeAutoHandles(nextPath: EditableCubicBezierPath, index: number): void {
  const n = nextPath.segments.length;
  if (n < 2) return;

  const segment = nextPath.segments[index];
  if (!segment || segment.type !== "auto") return;

  const anchor = segment.p;
  const hasPrev = nextPath.closed || index > 0;
  const hasNext = nextPath.closed || index < n - 1;
  const prevIndex = index > 0 ? index - 1 : n - 1;
  const nextIndex = index < n - 1 ? index + 1 : 0;
  const prev = hasPrev ? nextPath.segments[prevIndex].p : anchor;
  const next = hasNext ? nextPath.segments[nextIndex].p : anchor;

  let tangent: base.XYPosition;
  if (!hasPrev && hasNext) {
    tangent = normalize(sub(next, anchor));
  } else if (hasPrev && !hasNext) {
    tangent = normalize(sub(anchor, prev));
  } else {
    tangent = normalize(sub(next, prev));
  }

  const autoScale = 0.28;
  const inLen = Math.max(8, distance(anchor, prev) * autoScale);
  const outLen = Math.max(8, distance(anchor, next) * autoScale);
  segment.c0 = clampPoint(add(anchor, scale(tangent, -inLen)));
  segment.c1 = clampPoint(add(anchor, scale(tangent, outLen)));
}

function recomputeAutoNeighborhood(nextPath: EditableCubicBezierPath, index: number): void {
  const n = nextPath.segments.length;
  if (n < 2) return;

  const targets = [index];
  if (index > 0 || nextPath.closed) targets.push((index - 1 + n) % n);
  if (index < n - 1 || nextPath.closed) targets.push((index + 1) % n);

  for (const i of targets) {
    recomputeAutoHandles(nextPath, i);
  }
}

function beginDrag(kind: "anchor" | "c0" | "c1", index: number, ev: PointerEvent): void {
  if (ev.button !== 0) return;
  ev.preventDefault();
  ev.stopPropagation();

  ui = {
    ...ui,
    selectedIndex: index,
    preferredType: localPath.segments[index]?.type ?? ui.preferredType,
    drag: {
      kind,
      index,
      pointerId: ev.pointerId,
      startPoint: toWorld(ev),
      startPath: clonePath(localPath),
      moved: false,
    },
  };

  svgEl?.setPointerCapture(ev.pointerId);
}

function onPointerMove(ev: PointerEvent): void {
  if (!ui.drag || ev.pointerId !== ui.drag.pointerId) return;

  const current = toWorld(ev);
  const delta = sub(current, ui.drag.startPoint);
  const nextPath = clonePath(ui.drag.startPath);
  const segment = nextPath.segments[ui.drag.index];
  if (!segment) return;

  if (ui.drag.kind === "anchor") {
    segment.p = clampPoint(add(segment.p, delta));
    segment.c0 = clampPoint(add(segment.c0, delta));
    segment.c1 = clampPoint(add(segment.c1, delta));
    recomputeAutoNeighborhood(nextPath, ui.drag.index);
  } else {
    segment[ui.drag.kind] = clampPoint(current);
    enforceTypeConstraint(nextPath, ui.drag.index, ui.drag.kind, ui.drag.startPath);
  }

  ui = {
    ...ui,
    drag: {
      ...ui.drag,
      moved: ui.drag.moved || length(delta) > 0.75,
    },
  };

  localPath = nextPath;
  emitPath(nextPath);
}

function endDrag(ev: PointerEvent): void {
  if (!ui.drag || ev.pointerId !== ui.drag.pointerId) return;

  if (svgEl?.hasPointerCapture(ev.pointerId)) {
    svgEl.releasePointerCapture(ev.pointerId);
  }

  ui = {
    ...ui,
    suppressNodeClick: ui.drag.moved,
    drag: null,
  };
}

function normalizeNodeType(index: number, nextType: BezierNodeType): void {
  if (index < 0 || index >= localPath.segments.length) return;
  const nextPath = clonePath(localPath);
  const segment = nextPath.segments[index];
  segment.type = nextType;

  if (nextType === "sym") {
    const dir = normalize(sub(segment.c1, segment.p));
    const len = (distance(segment.c0, segment.p) + distance(segment.c1, segment.p)) / 2;
    segment.c0 = clampPoint(add(segment.p, scale(dir, -len)));
    segment.c1 = clampPoint(add(segment.p, scale(dir, len)));
  } else if (nextType === "smooth") {
    const dir = normalize(sub(segment.c1, segment.p));
    const inLen = Math.max(1, distance(segment.c0, segment.p));
    segment.c0 = clampPoint(add(segment.p, scale(dir, -inLen)));
  } else if (nextType === "auto") {
    recomputeAutoHandles(nextPath, index);
  }

  ui = {
    ...ui,
    preferredType: nextType,
  };
  localPath = nextPath;
  emitPath(nextPath);
}

function addNodeAfter(index: number): void {
  if (index < 0 || index >= localPath.segments.length) return;

  const nextPath = clonePath(localPath);
  const source = nextPath.segments[index];
  const isLastOpen = !nextPath.closed && index === nextPath.segments.length - 1;
  const nextIndex = isLastOpen ? index : (index + 1) % nextPath.segments.length;
  const target = nextPath.segments[nextIndex];

  const newType = ui.preferredType ?? source.type;
  const newAnchor = isLastOpen
    ? clampPoint(add(source.p, scale(sub(source.c1, source.p), 1.2)))
    : clampPoint(lerp(source.p, target.p, 0.5));

  const inserted: EditableBezierSegment = {
    type: newType,
    p: newAnchor,
    c0: clampPoint({ x: source.c1.x, y: source.c1.y }),
    c1: clampPoint(isLastOpen ? add(newAnchor, scale(sub(source.c1, source.p), 0.55)) : lerp(newAnchor, target.p, 0.35)),
  };

  if (source.type === "cusp" && newType === "cusp") {
    source.c1 = clampPoint(lerp(source.p, newAnchor, 1 / 3));
    inserted.c0 = clampPoint(lerp(source.p, newAnchor, 2 / 3));
    inserted.c1 = clampPoint(lerp(newAnchor, isLastOpen ? add(newAnchor, { x: 18, y: 0 }) : target.p, 1 / 3));
  }

  nextPath.segments.splice(index + 1, 0, inserted);
  recomputeAutoNeighborhood(nextPath, index);
  recomputeAutoNeighborhood(nextPath, index + 1);

  ui = {
    ...ui,
    selectedIndex: index + 1,
    preferredType: newType,
    suppressNodeClick: false,
  };
  localPath = nextPath;
  emitPath(nextPath);
}

function deleteSelectedNode(): void {
  const minCount = localPath.closed ? 3 : 2;
  if (localPath.segments.length <= minCount) return;

  const nextPath = clonePath(localPath);
  nextPath.segments.splice(ui.selectedIndex, 1);
  const nextIndex = Math.max(0, Math.min(ui.selectedIndex, nextPath.segments.length - 1));
  recomputeAutoNeighborhood(nextPath, nextIndex);

  ui = {
    ...ui,
    selectedIndex: nextIndex,
    preferredType: nextPath.segments[nextIndex]?.type ?? ui.preferredType,
  };
  localPath = nextPath;
  emitPath(nextPath);
}

function toggleClosed(): void {
  const nextPath = clonePath(localPath);
  nextPath.closed = !nextPath.closed;
  for (let i = 0; i < nextPath.segments.length; i += 1) {
    recomputeAutoHandles(nextPath, i);
  }
  localPath = nextPath;
  emitPath(nextPath);
}

function onAnchorClick(index: number): void {
  if (ui.suppressNodeClick) {
    ui = {
      ...ui,
      suppressNodeClick: false,
    };
    return;
  }

  if (ui.selectedIndex === index) {
    addNodeAfter(index);
    return;
  }

  ui = {
    ...ui,
    selectedIndex: index,
    preferredType: localPath.segments[index]?.type ?? ui.preferredType,
  };
}

function onAnchorKeyDown(index: number, ev: KeyboardEvent): void {
  if (ev.key !== "Enter" && ev.key !== " ") return;
  ev.preventDefault();
  onAnchorClick(index);
}

function close(): void {
  onclose?.();
}
</script>

{#if shapeType === "cubic-bezier"}
  <div class="bezier-overlay">
    <button type="button" class="overlay-backdrop" aria-label="Close cubic bezier editor" onclick={close}></button>

    <div class="bezier-panel" role="dialog" aria-modal="true" aria-label="Cubic bezier editor">
      <header class="panel-header">
        <div>
          <p class="eyebrow">Deep Edit</p>
          <h3>Cubic Bezier Editor</h3>
          <p class="meta">
            Nodes: {localPath.segments.length} | Path: {localPath.closed ? "Closed" : "Open"} | Node Types: {nodeTypesString || "-"}
          </p>
        </div>
        <button type="button" class="close-btn" onclick={close}>Close</button>
      </header>

      <div class="action-bar">
        <div class="type-group">
          <span>Node Type</span>
          <button type="button" class:selected={selectedType === "cusp"} onclick={() => normalizeNodeType(ui.selectedIndex, "cusp")}>Cusp</button>
          <button type="button" class:selected={selectedType === "smooth"} onclick={() => normalizeNodeType(ui.selectedIndex, "smooth")}>Smooth</button>
          <button type="button" class:selected={selectedType === "sym"} onclick={() => normalizeNodeType(ui.selectedIndex, "sym")}>Sym</button>
          <button type="button" class:selected={selectedType === "auto"} onclick={() => normalizeNodeType(ui.selectedIndex, "auto")}>Auto</button>
        </div>

        <div class="right-actions">
          <button type="button" onclick={toggleClosed}>{localPath.closed ? "Make Open" : "Make Closed"}</button>
          <button type="button" onclick={() => addNodeAfter(ui.selectedIndex)}>Add Next</button>
          <button type="button" class="danger" onclick={deleteSelectedNode}>Delete Node</button>
        </div>
      </div>

      <div class="editor-surface" bind:this={editorSurfaceEl}>
        <canvas bind:this={gridCanvas} class="grid" width={renderDimension.width} height={renderDimension.height}></canvas>

        <svg
          bind:this={svgEl}
          class="overlay-svg"
          width={renderDimension.width}
          height={renderDimension.height}
          viewBox={`0 0 ${renderDimension.width} ${renderDimension.height}`}
          role="img"
          aria-label="Cubic bezier editor surface"
          onpointerdown={beginPan}
          onpointermove={onEditorPointerMove}
          onpointerup={onEditorPointerUp}
          onpointercancel={onEditorPointerCancel}
          onpointerleave={endPan}
          onwheel={onWheel}
        >
          <g transform={`translate(${renderDimension.width / 2} ${renderDimension.height / 2}) scale(${worldScale}) translate(${-camera.x} ${-camera.y})`}>
            {#if pathD}
              <path d={pathD} class:closed={localPath.closed} class="curve" />
            {/if}

            {#each localPath.segments as segment, i}
              <line class="handle-link" x1={segment.p.x} y1={segment.p.y} x2={segment.c0.x} y2={segment.c0.y}></line>
              <line class="handle-link" x1={segment.p.x} y1={segment.p.y} x2={segment.c1.x} y2={segment.c1.y}></line>

              <circle
                class="control-point"
                cx={segment.c0.x}
                cy={segment.c0.y}
                r={5 / Math.max(worldScale, 0.001)}
                role="button"
                tabindex="-1"
                aria-label={`Control in ${i + 1}`}
                onpointerdown={(ev) => beginDrag("c0", i, ev)}
              />

              <circle
                class="control-point"
                cx={segment.c1.x}
                cy={segment.c1.y}
                r={5 / Math.max(worldScale, 0.001)}
                role="button"
                tabindex="-1"
                aria-label={`Control out ${i + 1}`}
                onpointerdown={(ev) => beginDrag("c1", i, ev)}
              />

              {#if segment.type === "cusp"}
                <rect
                  class="anchor cusp"
                  class:selected={ui.selectedIndex === i}
                  x={segment.p.x - (7 / Math.max(worldScale, 0.001))}
                  y={segment.p.y - (7 / Math.max(worldScale, 0.001))}
                  width={14 / Math.max(worldScale, 0.001)}
                  height={14 / Math.max(worldScale, 0.001)}
                  transform={`rotate(45 ${segment.p.x} ${segment.p.y})`}
                  role="button"
                  tabindex="-1"
                  aria-label={`Anchor ${i + 1} cusp`}
                  onpointerdown={(ev) => beginDrag("anchor", i, ev)}
                  onclick={() => onAnchorClick(i)}
                  onkeydown={(ev) => onAnchorKeyDown(i, ev)}
                />
              {:else if segment.type === "sym"}
                <rect
                  class="anchor sym"
                  class:selected={ui.selectedIndex === i}
                  x={segment.p.x - (6 / Math.max(worldScale, 0.001))}
                  y={segment.p.y - (6 / Math.max(worldScale, 0.001))}
                  width={12 / Math.max(worldScale, 0.001)}
                  height={12 / Math.max(worldScale, 0.001)}
                  role="button"
                  tabindex="-1"
                  aria-label={`Anchor ${i + 1} symmetric`}
                  onpointerdown={(ev) => beginDrag("anchor", i, ev)}
                  onclick={() => onAnchorClick(i)}
                  onkeydown={(ev) => onAnchorKeyDown(i, ev)}
                />
              {:else}
                <circle
                  class="anchor"
                  class:auto={segment.type === "auto"}
                  class:selected={ui.selectedIndex === i}
                  cx={segment.p.x}
                  cy={segment.p.y}
                  r={6 / Math.max(worldScale, 0.001)}
                  role="button"
                  tabindex="-1"
                  aria-label={`Anchor ${i + 1} ${segment.type}`}
                  onpointerdown={(ev) => beginDrag("anchor", i, ev)}
                  onclick={() => onAnchorClick(i)}
                  onkeydown={(ev) => onAnchorKeyDown(i, ev)}
                />
              {/if}
            {/each}
          </g>
        </svg>
      </div>

      <p class="hint">Tip: click a selected anchor to insert a new node next to it. Drag anchors and handles to edit the curve.</p>
    </div>
  </div>
{/if}

<style>
.bezier-overlay {
  position: absolute;
  inset: 0;
  z-index: 8;
  display: grid;
  place-items: center;
  background: rgba(8, 15, 28, 0.4);
  pointer-events: auto;
}

.overlay-backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  margin: 0;
  padding: 0;
  background: transparent;
}

.bezier-panel {
  position: relative;
  z-index: 1;
  width: min(1080px, calc(100% - 24px));
  max-height: calc(100% - 24px);
  overflow: auto;
  border-radius: 14px;
  border: 1px solid rgba(100, 116, 139, 0.38);
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.24);
  padding: 14px;
  display: grid;
  gap: 10px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.eyebrow {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #475569;
}

h3 {
  margin: 2px 0;
  font-size: 20px;
  line-height: 1.15;
}

.meta {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.type-group,
.right-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

button {
  border: 1px solid rgba(100, 116, 139, 0.35);
  background: #f8fafc;
  color: #0f172a;
  border-radius: 8px;
  padding: 6px 10px;
  font: inherit;
  cursor: pointer;
}

button.selected {
  background: #dbeafe;
  border-color: #60a5fa;
}

button.danger {
  background: #fee2e2;
  border-color: #fca5a5;
}

.editor-surface {
  position: relative;
  width: 100%;
  min-height: 420px;
  border: 1px solid rgba(100, 116, 139, 0.35);
  border-radius: 10px;
  overflow: hidden;
  background: #f8fafc;
}

.grid,
.overlay-svg {
  position: absolute;
  inset: 0;
  display: block;
}

.curve {
  fill: none;
  stroke: #2563eb;
  stroke-width: calc(2.5 / max(0.001, var(--zoom, 1)));
  vector-effect: non-scaling-stroke;
}

.curve.closed {
  fill: rgba(37, 99, 235, 0.12);
}

.handle-link {
  stroke: rgba(15, 23, 42, 0.45);
  stroke-dasharray: 4 3;
  vector-effect: non-scaling-stroke;
}

.control-point {
  fill: #0f172a;
  stroke: #ffffff;
  stroke-width: 1.2;
  cursor: grab;
  vector-effect: non-scaling-stroke;
}

.anchor {
  fill: #ffffff;
  stroke: #0f172a;
  stroke-width: 1.8;
  cursor: move;
  vector-effect: non-scaling-stroke;
}

.anchor.auto {
  fill: #dcfce7;
  stroke: #16a34a;
}

.anchor.sym {
  fill: #fef3c7;
  stroke: #d97706;
}

.anchor.cusp {
  fill: #fee2e2;
  stroke: #dc2626;
}

.anchor.selected {
  stroke-width: 2.4;
}

.hint {
  margin: 0;
  font-size: 12px;
  color: #334155;
}

.close-btn {
  align-self: flex-start;
}
</style>
