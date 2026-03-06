import type { LayerPayload } from "../types";

export interface MenuButton {
  code?: string;
  label: string | null;
  shortcut?: string;
}
export type MenuItem = MenuButton | "-";
export type MenuActionHandler = (payload: LayerPayload) => void;
