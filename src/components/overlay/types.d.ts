import type { Snippet } from "svelte";

export interface OverlayDisplayState {
  trigger: string;
  topLeft?: [top: number, left: number];
  payload: any;
};

export type DisplayStateSetter = (state: OverlayDisplayState | null) => void;

export interface OverlayChildUse {
  getState(): OverlayDisplayState;
  close(): void;
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
    code?: string;
    label: string | null;
    shortcut?: string; 
}
export type MenuItem = (MenuButton | "-");
export type MenuActionHandler = (payload: any) => void;
