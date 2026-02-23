import type { Snippet } from "svelte";

export interface OverlayDisplayState {
  uiName: string;
  mode: "ctx" | "top";
  left?: number;
  top?: number;
};

export type DisplayStateSetter = (state: OverlayDisplayState | null) => void;

export interface OverlayChildUse {
  close(): void;
  select(payload: any): void;
}

/**
 * A snippet function which takes an `OverlayChildUse`. Example:
 * 
 *  {#snippet myOverlayChildUI(overlay: OverlayChildUse)}
 *      . . .
 *  {/snippet}
 */
export type OverlaySnippet = Snippet<[OverlayChildUse]>;

export interface MenuButton {
    label: string | null;
    shortcut?: string; 
}
export type MenuItem = (MenuButton | "-");
