import type { LayerPayload } from "../types";

export interface MenuRow {
  code: string;
  label: string | null;
  shortcut?: string;
}

export type MenuItem = MenuRow | "-";
export type MenuActionHandler = (payload: LayerPayload) => void;
