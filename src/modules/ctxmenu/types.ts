import type { OverlayOptions, OverlayResult } from "@/modules/overlay2/types";

export interface CtxMenuBaseItem {
  label: string;
  icon?: CtxMenuIconCode;
  shortcut?: string;
  disabled?: boolean;
}

export interface CtxMenuLeafItem<TCode extends string = string>
  extends CtxMenuBaseItem {
  code: TCode;
  submenu?: never;
}

export interface CtxMenuSubmenuItem<TCode extends string = string>
  extends CtxMenuBaseItem {
  code?: never;
  submenu: readonly CtxMenuLeafItem<TCode>[];
}

export interface CtxMenuSeparatorItem extends CtxMenuBaseItem {
  separator: true;
  code?: never;
  submenu?: never;
}

export type CtxMenuItem<TCode extends string = string> =
  | CtxMenuLeafItem<TCode>
  | CtxMenuSubmenuItem<TCode>
  | CtxMenuSeparatorItem;

export interface CtxMenuPayload<TCode extends string = string> {
  x: number;
  y: number;
  items: readonly CtxMenuItem<TCode>[];
}

export interface CtxMenuSelection<TCode extends string = string> {
  code: TCode;
  pathLabels: [string] | [string, string];
  pathIndexes: [number] | [number, number];
  fromSubmenu: boolean;
}

export type CtxMenuOpenResult<TCode extends string = string> = OverlayResult<
  CtxMenuSelection<TCode>
>;

export interface OpenCtxMenuArgs<TCode extends string = string> {
  x: number;
  y: number;
  items: readonly CtxMenuItem<TCode>[];
  options?: Partial<OverlayOptions>;
}

export type CtxMenuIconCode =
  | "arrow-clockwise"
  | "caret-right"
  | "clipboard"
  | "code"
  | "info"
  | "line-vertical"
  | "pencil"
  | "plus"
  | "stack-minus"
  | "stack-plus"
  | "trash";

export function isSubmenuItem<TCode extends string>(
  item: CtxMenuItem<TCode>,
): item is CtxMenuSubmenuItem<TCode> {
  return "submenu" in item && item.submenu !== undefined;
}

export function isSeparatorItem<TCode extends string>(
  item: CtxMenuItem<TCode>,
): item is CtxMenuSeparatorItem {
  return "separator" in item && item.separator === true;
}
