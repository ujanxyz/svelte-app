import "svelte/elements";

import type { Snippet } from "svelte";

export interface StatusOr<T> {
  status: string;
  value?: T;
  reason?: any;
}

export interface ClientXY {
  x: number;
  y: number;
}

export interface ClientRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type LayerPayload = Record<string, any>;

export interface CreatorUse {
  openOverlayAsync<T>(payload: LayerPayload): Promise<StatusOr<T>>;
}

export interface DescendantUse {
  settleOverlay<T>(value: T): void;
  abortOverlay(customStatus?: string): void;
}

export interface LayerUse extends DescendantUse {
  getLayerPayload(): LayerPayload;
  setDebugName(name: string): void;
}

export type LayerSnippetFn = Snippet<[]>;

export interface LayerData {
  layerId: string;
  payload: LayerPayload;
  renderfn: LayerSnippetFn;
  descendantUse: DescendantUse;
}

export type ResolveFn<T> = (value: T) => void;

export interface OverlayEntry {
  layerId: string;
  payload: LayerPayload;
  renderfn: Snippet;
  resolve: ResolveFn<unknown>;
  reject: (reason: any) => void;
  descendantUse: DescendantUse;
}

declare module "svelte/elements" {
  export interface DOMAttributes<T extends EventTarget> {
    "on:clickoutside"?: (event: CustomEvent) => void;
    onclickoutside?: (event: CustomEvent) => void;
  }
}
