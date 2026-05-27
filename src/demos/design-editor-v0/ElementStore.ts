import { SvelteMap, SvelteSet } from "svelte/reactivity";

import { newRandomId } from "@/jsutils/idUtils";

import type {
  AlignMode,
  CanvasElement,
  DistributionDirection,
  ElementType,
  RotatedRect,
  RotatedrectDelta,
} from "./types";

const DEFAULT_HIT_COLOR = "#000000FF";
const DUPLICATE_OFFSET = 16;
const MIN_SIZE = 1;

interface SerializedStore {
  elements: Omit<CanvasElement, "draw" | "drawHit" | "getBounds">[];
  order: string[];
  selectedIds: string[];
}

function clampOpacity(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function clampPositive(value: number): number {
  return Math.max(MIN_SIZE, value);
}

function lineEndpoints(el: CanvasElement): { x1: number; y1: number; x2: number; y2: number } {
  const x1 = el.x;
  const y1 = el.y;
  const rotationRad = ((el.rotation ?? 0) * Math.PI) / 180;
  const x2 = x1 + Math.cos(rotationRad) * el.width;
  const y2 = y1 + Math.sin(rotationRad) * el.width;
  return { x1, y1, x2, y2 };
}

function withElementRotation(ctx: CanvasRenderingContext2D, element: CanvasElement, draw: () => void): void {
  const rotation = element.rotation ?? 0;
  if (!rotation) {
    draw();
    return;
  }

  const cx = element.x + element.width / 2;
  const cy = element.y + element.height / 2;
  ctx.translate(cx, cy);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-cx, -cy);
  draw();
}

function boundsFromElement(this: CanvasElement): RotatedRect {
  if (this.type === "line") {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: 0,
      rotationDeg: this.rotation ?? 0,
    };
  }

  if (this.type === "circle") {
    const radius = this.radius ?? Math.min(this.width, this.height) / 2;
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    return {
      x: cx - radius,
      y: cy - radius,
      width: radius * 2,
      height: radius * 2,
      rotationDeg: 0,
    };
  }

  if (this.type === "star") {
    const outer = this.outerRadius ?? Math.max(this.width, this.height) / 2;
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    return {
      x: cx - outer,
      y: cy - outer,
      width: outer * 2,
      height: outer * 2,
      rotationDeg: this.rotation ?? 0,
    };
  }

  return {
    x: this.x,
    y: this.y,
    width: this.width,
    height: this.height,
    rotationDeg: this.rotation ?? 0,
  };
}

function drawElement(this: CanvasElement, ctx: CanvasRenderingContext2D): void {
  if (!this.visible) return;

  ctx.save();
  ctx.globalAlpha = clampOpacity(this.opacity);
  ctx.strokeStyle = this.stroke;
  ctx.fillStyle = this.fill;
  ctx.lineWidth = Math.max(1, this.strokeWidth || 1);

  if (this.type === "rect" || this.type === "group") {
    withElementRotation(ctx, this, () => {
      if (this.type === "group") {
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = this.stroke || "#94a3b8";
        ctx.strokeRect(this.x, this.y, this.width, this.height);
      } else {
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x, this.y, this.width, this.height);
      }
    });
    ctx.restore();
    return;
  }

  if (this.type === "circle") {
    const radius = this.radius ?? Math.min(this.width, this.height) / 2;
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (this.type === "line") {
    const { x1, y1, x2, y2 } = lineEndpoints(this);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (this.type === "star") {
    const points = Math.max(3, Math.floor(this.points ?? 5));
    const inner = this.innerRadius ?? Math.min(this.width, this.height) * 0.25;
    const outer = this.outerRadius ?? Math.max(this.width, this.height) * 0.5;
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    withElementRotation(ctx, this, () => {
      ctx.beginPath();
      for (let i = 0; i < points * 2; i += 1) {
        const radius = i % 2 === 0 ? outer : inner;
        const angle = -Math.PI / 2 + (i * Math.PI) / points;
        const px = cx + Math.cos(angle) * radius;
        const py = cy + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();
    return;
  }

  // Dummy image drawing until source binding is wired.
  withElementRotation(ctx, this, () => {
    ctx.fillStyle = "#dbeafe";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.strokeStyle = this.stroke || "#1d4ed8";
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.width, this.y + this.height);
    ctx.moveTo(this.x + this.width, this.y);
    ctx.lineTo(this.x, this.y + this.height);
    ctx.stroke();
  });
  ctx.restore();
}

function drawElementHit(this: CanvasElement, ctx: CanvasRenderingContext2D): void {
  if (!this.visible) return;

  ctx.save();
  ctx.fillStyle = this.hitColor || DEFAULT_HIT_COLOR;
  ctx.strokeStyle = this.hitColor || DEFAULT_HIT_COLOR;
  ctx.lineWidth = Math.max(1, this.strokeWidth || 1);

  if (this.type === "line") {
    const { x1, y1, x2, y2 } = lineEndpoints(this);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(12, this.strokeWidth + 10);
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (this.type === "circle") {
    const radius = this.radius ?? Math.min(this.width, this.height) / 2;
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    return;
  }

  if (this.type === "star") {
    const points = Math.max(3, Math.floor(this.points ?? 5));
    const inner = this.innerRadius ?? Math.min(this.width, this.height) * 0.25;
    const outer = (this.outerRadius ?? Math.max(this.width, this.height) * 0.5) + 2;
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    withElementRotation(ctx, this, () => {
      ctx.beginPath();
      for (let i = 0; i < points * 2; i += 1) {
        const radius = i % 2 === 0 ? outer : inner;
        const angle = -Math.PI / 2 + (i * Math.PI) / points;
        const px = cx + Math.cos(angle) * radius;
        const py = cy + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();
    return;
  }

  withElementRotation(ctx, this, () => {
    ctx.fillRect(this.x - 1, this.y - 1, this.width + 2, this.height + 2);
  });
  ctx.restore();
}

function ensureElementMethods(element: CanvasElement): CanvasElement {
  if (!element.draw) element.draw = drawElement;
  if (!element.drawHit) element.drawHit = drawElementHit;
  if (!element.getBounds) element.getBounds = boundsFromElement;
  return element;
}

function normalizeElement(input: CanvasElement): CanvasElement {
  const element: CanvasElement = {
    ...input,
    name: input.name || input.id,
    width: clampPositive(input.width),
    height: input.type === "line" ? 0 : clampPositive(input.height),
    rotation: input.rotation ?? 0,
    opacity: clampOpacity(input.opacity ?? 1),
    visible: input.visible ?? true,
    locked: input.locked ?? false,
    fill: input.fill ?? "#94a3b8",
    stroke: input.stroke ?? "#1f2937",
    strokeWidth: Math.max(1, input.strokeWidth ?? 1),
    zIndex: Math.max(0, input.zIndex ?? 0),
    hitId: input.hitId ?? -1,
    hitColor: input.hitColor ?? DEFAULT_HIT_COLOR,
  };

  return ensureElementMethods(element);
}

type CreateElementInput = {
  id?: string;
  type: ElementType;
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  visible?: boolean;
  locked?: boolean;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  zIndex?: number;
  parentId?: string;
  hitId?: number;
  hitColor?: string;
  radius?: number;
  points?: number;
  innerRadius?: number;
  outerRadius?: number;
  source?: string;
  childIds?: string[];
};

export function createElement(input: CreateElementInput): CanvasElement {
  const id = input.id ?? `${input.type}-${newRandomId()}`;
  return normalizeElement({
    id,
    type: input.type,
    name: input.name ?? id,
    x: input.x,
    y: input.y,
    width: input.width,
    height: input.height,
    rotation: input.rotation ?? 0,
    opacity: input.opacity ?? 1,
    visible: input.visible ?? true,
    locked: input.locked ?? false,
    fill: input.fill ?? "#94a3b8",
    stroke: input.stroke ?? "#1f2937",
    strokeWidth: input.strokeWidth ?? 1,
    parentId: input.parentId,
    zIndex: input.zIndex ?? 0,
    hitId: input.hitId ?? -1,
    hitColor: input.hitColor ?? DEFAULT_HIT_COLOR,
    radius: input.radius,
    points: input.points,
    innerRadius: input.innerRadius,
    outerRadius: input.outerRadius,
    source: input.source,
    childIds: input.childIds,
    draw: drawElement,
    drawHit: drawElementHit,
    getBounds: boundsFromElement,
  });
}

export function createDemoElements(pageWidth = 1200, pageHeight = 800): CanvasElement[] {
  const halfW = pageWidth / 2;
  const halfH = pageHeight / 2;
  console.log("Creating demo elements with page size", pageWidth, pageHeight);

  return [
    createElement({
      id: "l-100",
      type: "line",
      name: "Line 100",
      x: 0,
      y: 0,
      width: Math.hypot(-500, 500),
      height: 0,
      rotation: (Math.atan2(500, -500) * 180) / Math.PI,
      stroke: "#b45309",
      fill: "#b45309",
      strokeWidth: 8,
      zIndex: 1,
    }),
    createElement({
      id: "c-1",
      type: "circle",
      name: "Circle 1",
      x: -halfW + 40,
      y: -halfH + 30,
      width: 80,
      height: 80,
      radius: 40,
      fill: "#fd6a6a",
      stroke: "#7f1d1d",
      zIndex: 1,
    }),
    createElement({
      id: "c-2",
      type: "circle",
      name: "Circle 2",
      x: 105,
      y: -85,
      width: 130,
      height: 130,
      radius: 65,
      fill: "#3f96ff",
      stroke: "#1e3a8a",
      zIndex: 2,
    }),
    createElement({
      id: "c-3",
      type: "circle",
      name: "Circle 3",
      x: halfW - 108,
      y: halfH - 88,
      width: 96,
      height: 96,
      radius: 48,
      fill: "#32b87f",
      stroke: "#14532d",
      zIndex: 3,
    }),
    createElement({
      id: "r-1",
      type: "rect",
      name: "Rect 1",
      x: -halfW + 20,
      y: halfH - 120,
      width: 140,
      height: 80,
      fill: "#ff7f50",
      stroke: "#7c2d12",
      zIndex: 2,
    }),
    createElement({
      id: "r-2",
      type: "rect",
      name: "Rect 2",
      x: 120,
      y: -halfH + 30,
      width: 110,
      height: 130,
      fill: "#00a896",
      stroke: "#134e4a",
      zIndex: 2,
    }),
    createElement({
      id: "r-3",
      type: "rect",
      name: "Rect 3",
      x: -150,
      y: 90,
      width: 180,
      height: 70,
      fill: "#4361ee",
      stroke: "#312e81",
      zIndex: 1,
    }),
    createElement({
      id: "l-1",
      type: "line",
      name: "Line 1",
      x: -halfW + 30,
      y: -30,
      width: Math.hypot(190, 100),
      height: 0,
      rotation: (Math.atan2(100, 190) * 180) / Math.PI,
      stroke: "#0f766e",
      fill: "#0f766e",
      strokeWidth: 3,
      zIndex: 2,
    }),
    createElement({
      id: "l-2",
      type: "line",
      name: "Line 2",
      x: halfW - 200,
      y: -halfH + 20,
      width: Math.hypot(180, 110),
      height: 0,
      rotation: (Math.atan2(110, 180) * 180) / Math.PI,
      stroke: "#b45309",
      fill: "#b45309",
      strokeWidth: 3,
      zIndex: 1,
    }),
    createElement({
      id: "s-1",
      type: "star",
      name: "Star 1",
      x: halfW - 165,
      y: halfH - 135,
      width: 90,
      height: 90,
      points: 5,
      innerRadius: 22,
      outerRadius: 45,
      fill: "#f97316",
      stroke: "#7c2d12",
      zIndex: 2,
    }),
    createElement({
      id: "s-2",
      type: "star",
      name: "Star 2",
      x: -halfW + 78,
      y: halfH - 92,
      width: 84,
      height: 84,
      points: 7,
      innerRadius: 18,
      outerRadius: 42,
      fill: "#22c55e",
      stroke: "#14532d",
      zIndex: 1,
    }),
    createElement({
      id: "img-1",
      type: "image",
      name: "Image Placeholder",
      x: -30,
      y: 120,
      width: 140,
      height: 90,
      fill: "#dbeafe",
      stroke: "#1d4ed8",
      zIndex: 3,
    }),
  ];
}

function cloneForSerialize(element: CanvasElement): Omit<CanvasElement, "draw" | "drawHit" | "getBounds"> {
  const { draw: _draw, drawHit: _drawHit, getBounds: _getBounds, ...rest } = element;
  return rest;
}

function idSet(ids: string[]): Set<string> {
  return new Set(ids);
}

/**
 * Element store backed by mutable map/set collections.
 */
export class ElementStore {
  elements = new SvelteMap<string, CanvasElement>();
  order: string[] = [];
  selectedIds = new SvelteSet<string>();

  get selection(): CanvasElement[] {
    return this.order
      .filter((id) => this.selectedIds.has(id))
      .map((id) => this.elements.get(id))
      .filter((el): el is CanvasElement => !!el);
  }

  add(element: CanvasElement): void {
    const normalized = normalizeElement(element);
    const existing = this.elements.has(normalized.id);

    this.elements.set(normalized.id, normalized);
    if (!existing) {
      this.order = [...this.order, normalized.id];
    }

    this.#syncZOrder();
  }

  delete(ids: string[]): void {
    if (!ids.length) return;
    const doomed = idSet(ids);

    for (const id of doomed) {
      this.elements.delete(id);
      this.selectedIds.delete(id);
    }

    this.order = this.order.filter((id) => !doomed.has(id));

    for (const element of this.elements.values()) {
      if (element.parentId && doomed.has(element.parentId)) {
        this.elements.set(element.id, normalizeElement({ ...element, parentId: undefined }));
      }
    }

    this.#syncZOrder();
  }

  duplicate(ids: string[]): void {
    const ordered = this.order.filter((id) => ids.includes(id));
    if (!ordered.length) return;

    const clones: CanvasElement[] = [];
    for (const id of ordered) {
      const src = this.elements.get(id);
      if (!src) continue;

      const nextId = this.#nextId(`${src.type}-`);
      const clone = normalizeElement({
        ...src,
        id: nextId,
        name: `${src.name} copy`,
        x: src.x + DUPLICATE_OFFSET,
        y: src.y + DUPLICATE_OFFSET,
        parentId: src.parentId,
        hitId: -1,
        hitColor: DEFAULT_HIT_COLOR,
      });
      clones.push(clone);
    }

    for (const clone of clones) {
      this.elements.set(clone.id, clone);
      this.order = [...this.order, clone.id];
    }

    this.select(clones.map((clone) => clone.id), false);
    this.#syncZOrder();
  }

  updateProps(ids: string[], props: Partial<CanvasElement>): void {
    for (const id of ids) {
      const current = this.elements.get(id);
      if (!current || current.locked) continue;

      const next = normalizeElement({
        ...current,
        ...props,
        id: current.id,
        type: current.type,
        draw: current.draw,
        drawHit: current.drawHit,
        getBounds: current.getBounds,
      });
      this.elements.set(id, next);
    }
  }

  transform(ids: string[], delta: RotatedrectDelta): void {
    for (const id of ids) {
      const current = this.elements.get(id);
      if (!current || current.locked) continue;

      const next = { ...current };

      if (delta.x) {
        next.x += delta.x;
      }
      if (delta.y) {
        next.y += delta.y;
      }
      if (delta.width) {
        next.width = clampPositive(next.width + delta.width);
      }
      if (delta.height) {
        next.height = next.type === "line" ? 0 : clampPositive(next.height + delta.height);
      }
      if (delta.rotationDeg) {
        next.rotation += delta.rotationDeg;
      }

      this.elements.set(id, normalizeElement(next));
    }
  }

  bringToFront(ids: string[]): void {
    const selected = this.order.filter((id) => ids.includes(id));
    if (!selected.length) return;

    const selectedSet = idSet(selected);
    const rest = this.order.filter((id) => !selectedSet.has(id));
    this.order = [...rest, ...selected];
    this.#syncZOrder();
  }

  sendToBack(ids: string[]): void {
    const selected = this.order.filter((id) => ids.includes(id));
    if (!selected.length) return;

    const selectedSet = idSet(selected);
    const rest = this.order.filter((id) => !selectedSet.has(id));
    this.order = [...selected, ...rest];
    this.#syncZOrder();
  }

  stepForward(ids: string[]): void {
    const selected = idSet(ids);
    const nextOrder = [...this.order];

    for (let i = nextOrder.length - 2; i >= 0; i -= 1) {
      const id = nextOrder[i];
      const nextId = nextOrder[i + 1];
      if (!selected.has(id) || selected.has(nextId)) continue;
      nextOrder[i] = nextId;
      nextOrder[i + 1] = id;
    }

    this.order = nextOrder;
    this.#syncZOrder();
  }

  stepBackward(ids: string[]): void {
    const selected = idSet(ids);
    const nextOrder = [...this.order];

    for (let i = 1; i < nextOrder.length; i += 1) {
      const id = nextOrder[i];
      const prevId = nextOrder[i - 1];
      if (!selected.has(id) || selected.has(prevId)) continue;
      nextOrder[i] = prevId;
      nextOrder[i - 1] = id;
    }

    this.order = nextOrder;
    this.#syncZOrder();
  }

  group(ids: string[]): string {
    // Temporarily disabled until oriented-bounds semantics are fully defined.
    // const members = this.order.filter((id) => ids.includes(id));
    // if (members.length < 2) return "";
    // const bounds = this.#combinedBounds(members);
    // const groupId = this.#nextId("group-");
    // ...
    return "";
  }

  ungroup(groupId: string): void {
    // Temporarily disabled until oriented-bounds semantics are fully defined.
    // const group = this.elements.get(groupId);
    // if (!group || group.type !== "group") return;
    // ...
    void groupId;
  }

  align(ids: string[], mode: AlignMode): void {
    // Temporarily disabled until oriented-bounds semantics are fully defined.
    // const aligned = ids
    //   .map((id) => this.elements.get(id))
    //   .filter((el): el is CanvasElement => !!el)
    //   .filter((el) => !el.locked);
    // ...
    void ids;
    void mode;
  }

  distribute(ids: string[], direction: DistributionDirection): void {
    // Temporarily disabled until oriented-bounds semantics are fully defined.
    // const items = ids
    //   .map((id) => this.elements.get(id))
    //   .filter((el): el is CanvasElement => !!el)
    //   .filter((el) => !el.locked);
    // ...
    void ids;
    void direction;
  }

  lock(ids: string[]): void {
    this.updateProps(ids, { locked: true });
  }

  unlock(ids: string[]): void {
    this.updateProps(ids, { locked: false });
  }

  hide(ids: string[]): void {
    this.updateProps(ids, { visible: false });
    for (const id of ids) this.selectedIds.delete(id);
  }

  show(ids: string[]): void {
    this.updateProps(ids, { visible: true });
  }

  select(ids: string[], additive = false): void {
    if (!additive) this.selectedIds.clear();
    for (const id of ids) {
      if (this.elements.has(id)) this.selectedIds.add(id);
    }
  }

  deselectAll(): void {
    this.selectedIds.clear();
  }

  selectAll(): void {
    this.selectedIds.clear();
    for (const id of this.order) {
      this.selectedIds.add(id);
    }
  }

  serialize(): string {
    const payload: SerializedStore = {
      elements: this.order
        .map((id) => this.elements.get(id))
        .filter((el): el is CanvasElement => !!el)
        .map((el) => cloneForSerialize(el)),
      order: [...this.order],
      selectedIds: Array.from(this.selectedIds),
    };

    return JSON.stringify(payload);
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data) as SerializedStore;

    this.elements.clear();
    this.order = [];
    this.selectedIds.clear();

    for (const rawElement of parsed.elements ?? []) {
      const normalized = normalizeElement(rawElement as CanvasElement);
      this.elements.set(normalized.id, normalized);
    }

    const nextOrder = (parsed.order ?? []).filter((id) => this.elements.has(id));
    this.order = nextOrder;

    for (const id of parsed.selectedIds ?? []) {
      if (this.elements.has(id)) this.selectedIds.add(id);
    }

    this.#syncZOrder();
  }

  #nextId(prefix = "el-"): string {
    let id = `${prefix}${newRandomId()}`;
    while (this.elements.has(id)) {
      id = `${prefix}${newRandomId()}`;
    }
    return id;
  }

  #syncZOrder(): void {
    this.order.forEach((id, idx) => {
      const current = this.elements.get(id);
      if (!current) return;
      if (current.zIndex === idx) return;
      this.elements.set(id, normalizeElement({ ...current, zIndex: idx }));
    });
  }

  // #combinedBounds(ids: string[]): Rect {
  //   const rects = ids
  //     .map((id) => this.elements.get(id))
  //     .filter((el): el is CanvasElement => !!el)
  //     .map((el) => el.getBounds());

  //   if (!rects.length) return { x: 0, y: 0, width: 0, height: 0 };

  //   const minX = Math.min(...rects.map((r) => r.x));
  //   const minY = Math.min(...rects.map((r) => r.y));
  //   const maxX = Math.max(...rects.map((r) => r.x + r.width));
  //   const maxY = Math.max(...rects.map((r) => r.y + r.height));

  //   return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  // }
}
