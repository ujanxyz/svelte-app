import { SvelteMap, SvelteSet } from "svelte/reactivity";

import { newRandomId } from "@/jsutils/idUtils";

import { type DrawStyle, type GraphicBase, GraphicTypeEnums, ShapeGraphicBase } from "./GraphicBase";
import { CircleGraphic, ImageGraphic, LineGraphic, RectGraphic, StarGraphic } from "./GraphicTypes";
import type { AlignMode, DistributionDirection, RotatedRect, RotatedRectDelta } from "./types";

const DEFAULT_HIT_COLOR = "#000000FF";
const DUPLICATE_OFFSET = 16;
const MIN_SIZE = 1;

interface SerializedGraphic {
  id: string;
  type: (typeof GraphicTypeEnums)[keyof typeof GraphicTypeEnums];
  name: string;
  parentId?: string;
  transform: RotatedRect;
  hit: { hitId: number; hitColor: string };
  config: { zIndex: number; visible: boolean; locked: boolean };
  style?: DrawStyle;
}

interface SerializedStore {
  elements: SerializedGraphic[];
  order: string[];
  selectedIds: string[];
}

export type GraphicUpdateProps = {
  name?: string;
  parentId?: string;
  zIndex?: number;
  visible?: boolean;
  locked?: boolean;
  hitId?: number;
  hitColor?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotationDeg?: number;
};

function clampPositive(value: number): number {
  return Math.max(MIN_SIZE, value);
}

function idSet(ids: string[]): Set<string> {
  return new Set(ids);
}

function createGraphicByType(type: (typeof GraphicTypeEnums)[keyof typeof GraphicTypeEnums], id?: string): GraphicBase {
  if (type === GraphicTypeEnums.Rect) return new RectGraphic(id);
  if (type === GraphicTypeEnums.Circle) return new CircleGraphic(id);
  if (type === GraphicTypeEnums.Line) return new LineGraphic(id);
  if (type === GraphicTypeEnums.Star) return new StarGraphic(id);
  if (type === GraphicTypeEnums.Image) return new ImageGraphic(id);
  // Group is not implemented as GraphicBase yet; fallback to rect keeps store usable.
  return new RectGraphic(id);
}

/**
 * Element store backed by mutable map/set collections.
 */
export class ElementStore {
  elements = new SvelteMap<string, GraphicBase>();
  names = new SvelteMap<string, string>();
  parentIds = new SvelteMap<string, string | undefined>();
  selectedIds = new SvelteSet<string>();
  order: string[] = [];

  get selection(): GraphicBase[] {
    return this.order
      .filter((id) => this.selectedIds.has(id))
      .map((id) => this.elements.get(id))
      .filter((el): el is GraphicBase => !!el);
  }

  add(element: GraphicBase, name?: string): void {
    const existing = this.elements.has(element.id);

    this.elements.set(element.id, element);
    this.names.set(element.id, name ?? this.names.get(element.id) ?? element.id);
    if (!existing) {
      this.order = [...this.order, element.id];
    }

    this.#syncZOrder();
  }

  delete(ids: string[]): void {
    if (!ids.length) return;
    const doomed = idSet(ids);

    for (const id of doomed) {
      this.elements.delete(id);
      this.names.delete(id);
      this.parentIds.delete(id);
      this.selectedIds.delete(id);
    }

    this.order = this.order.filter((id) => !doomed.has(id));

    for (const [id, parentId] of this.parentIds.entries()) {
      if (parentId && doomed.has(parentId)) {
        this.parentIds.set(id, undefined);
      }
    }

    this.#syncZOrder();
  }

  duplicate(ids: string[]): void {
    const ordered = this.order.filter((id) => ids.includes(id));
    if (!ordered.length) return;

    const clones: GraphicBase[] = [];
    for (const id of ordered) {
      const src = this.elements.get(id);
      if (!src) continue;

      const clone = this.#cloneGraphic(src, this.#nextId(`${src.type}-`));
      const srcTx = src.getTransform();
      clone.updateTransform({
        x: srcTx.x + DUPLICATE_OFFSET,
        y: srcTx.y + DUPLICATE_OFFSET,
      });
      clone.setHitData(-1, DEFAULT_HIT_COLOR);
      clones.push(clone);

      this.names.set(clone.id, `${this.names.get(id) ?? id} copy`);
      this.parentIds.set(clone.id, this.parentIds.get(id));
    }

    for (const clone of clones) {
      this.elements.set(clone.id, clone);
      this.order = [...this.order, clone.id];
    }

    this.select(clones.map((clone) => clone.id), false);
    this.#syncZOrder();
  }

  updateProps(ids: string[], props: Partial<GraphicUpdateProps>): void {
    for (const id of ids) {
      const current = this.elements.get(id);
      if (!current || current.getConfig().locked) continue;

      if (props.name !== undefined) this.names.set(id, props.name);
      if (props.parentId !== undefined) this.parentIds.set(id, props.parentId);

      const nextTx: Partial<RotatedRect> = {};
      if (props.x !== undefined) nextTx.x = props.x;
      if (props.y !== undefined) nextTx.y = props.y;
      if (props.width !== undefined) nextTx.width = clampPositive(props.width);
      if (props.height !== undefined) nextTx.height = current.type === "line" ? 0 : clampPositive(props.height);
      if (props.rotationDeg !== undefined) nextTx.rotationDeg = props.rotationDeg;
      if (Object.keys(nextTx).length) {
        current.updateTransform(nextTx);
      }

      const nextConfig: { zIndex?: number; visible?: boolean; locked?: boolean } = {};
      if (props.zIndex !== undefined) nextConfig.zIndex = props.zIndex;
      if (props.visible !== undefined) nextConfig.visible = props.visible;
      if (props.locked !== undefined) nextConfig.locked = props.locked;
      if (Object.keys(nextConfig).length) {
        current.updateConfig(nextConfig);
      }

      if (props.hitId !== undefined || props.hitColor !== undefined) {
        const hit = current.getHitData();
        current.setHitData(props.hitId ?? hit.hitId, props.hitColor ?? hit.hitColor);
      }
    }
  }

  transform(ids: string[], delta: RotatedRectDelta): void {
    for (const id of ids) {
      const current = this.elements.get(id);
      if (!current || current.getConfig().locked) continue;

      const tx = current.getTransform();
      const next: Partial<RotatedRect> = {};

      if (delta.x) {
        next.x = tx.x + delta.x;
      }
      if (delta.y) {
        next.y = tx.y + delta.y;
      }
      if (delta.width) {
        next.width = clampPositive(tx.width + delta.width);
      }
      if (delta.height) {
        next.height = current.type === "line" ? 0 : clampPositive(tx.height + delta.height);
      }
      if (delta.rotationDeg) {
        next.rotationDeg = tx.rotationDeg + delta.rotationDeg;
      }

      if (Object.keys(next).length) {
        current.updateTransform(next);
      }
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
    void ids;
    return "";
  }

  ungroup(groupId: string): void {
    void groupId;
  }

  align(ids: string[], mode: AlignMode): void {
    void ids;
    void mode;
  }

  distribute(ids: string[], direction: DistributionDirection): void {
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
        .filter((el): el is GraphicBase => !!el)
        .map((el) => {
          const shapeStyle = el instanceof ShapeGraphicBase ? el.getStyle() : undefined;
          return {
            id: el.id,
            type: el.type,
            name: this.names.get(el.id) ?? el.id,
            parentId: this.parentIds.get(el.id),
            transform: el.getTransform(),
            hit: el.getHitData(),
            config: el.getConfig(),
            style: shapeStyle,
          };
        }),
      order: [...this.order],
      selectedIds: Array.from(this.selectedIds),
    };

    return JSON.stringify(payload);
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data) as SerializedStore;

    this.elements.clear();
    this.names.clear();
    this.parentIds.clear();
    this.order = [];
    this.selectedIds.clear();

    for (const raw of parsed.elements ?? []) {
      const graphic = createGraphicByType(raw.type, raw.id);
      graphic.updateTransform(raw.transform);
      graphic.updateConfig(raw.config);
      graphic.setHitData(raw.hit.hitId, raw.hit.hitColor);
      if (raw.style && graphic instanceof ShapeGraphicBase) {
        graphic.updateStyle(raw.style);
      }

      this.elements.set(graphic.id, graphic);
      this.names.set(graphic.id, raw.name ?? graphic.id);
      this.parentIds.set(graphic.id, raw.parentId);
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

  #cloneGraphic(source: GraphicBase, id: string): GraphicBase {
    const clone = createGraphicByType(source.type, id);
    clone.updateTransform(source.getTransform());
    clone.updateConfig(source.getConfig());
    clone.setHitData(source.getHitData().hitId, source.getHitData().hitColor);

    if (source instanceof ShapeGraphicBase && clone instanceof ShapeGraphicBase) {
      clone.updateStyle(source.getStyle());
    }

    return clone;
  }

  #syncZOrder(): void {
    this.order.forEach((id, idx) => {
      const current = this.elements.get(id);
      if (!current) return;
      if (current.getZIndex() === idx) return;
      current.updateConfig({ zIndex: idx });
    });
  }
}
