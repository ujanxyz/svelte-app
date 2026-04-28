import type { Snippet } from "svelte";
import type { Subscriber, Unsubscriber } from "svelte/store";

import { type overlayStatuses } from "./constants";

export type OverlayStatus =
  (typeof overlayStatuses)[keyof typeof overlayStatuses];

export type OverlayAbortStatus = Exclude<
  OverlayStatus,
  typeof overlayStatuses.OK
>;

export interface OverlaySuccess<TResult> {
  status: typeof overlayStatuses.OK;
  value: TResult;
}

export interface OverlayFailure {
  status: OverlayAbortStatus;
  reason: Error;
}

export type OverlayResult<TResult> =
  | OverlaySuccess<TResult>
  | OverlayFailure;

export interface OverlayOptions {
  dismissOnBackdrop: boolean;
  dismissOnEscape: boolean;
  closeOnWindowResize: boolean;
}

export interface OverlayRequest<TPayload, TResult> {
  payload: TPayload;
  options: OverlayOptions;
  render: Snippet<[]>;
}

export interface OverlayEntry<TPayload = unknown, TResult = unknown> {
  id: string;
  payload: TPayload;
  options: OverlayOptions;
  render: Snippet<[]>;
  resolve: (value: TResult) => void;
  reject: (reason: unknown) => void;
}

export interface OverlayHandle<TResult> {
  id: string;
  promise: Promise<OverlayResult<TResult>>;
  settle: (value: TResult) => void;
  abort: (status?: OverlayAbortStatus) => void;
}

export interface OverlayManager {
  subscribe(run: Subscriber<OverlayEntry[]>): Unsubscriber;
  open<TPayload, TResult>(
    request: OverlayRequest<TPayload, TResult>,
  ): OverlayHandle<TResult>;
  settle<TResult>(id: string, value: TResult): void;
  abort(id: string, status?: OverlayAbortStatus): void;
  abortTop(status?: OverlayAbortStatus): void;
  abortAll(status?: OverlayAbortStatus): void;
}

export interface OverlayController<TPayload, TResult> {
  open(
    payload: TPayload,
    options?: Partial<OverlayOptions>,
  ): Promise<OverlayResult<TResult>>;
  settle(value: TResult): void;
  abort(status?: OverlayAbortStatus): void;
}

export interface OverlayInstance<TPayload = unknown, TResult = unknown> {
  id: string;
  payload: TPayload;
  options: OverlayOptions;
  manager: OverlayManager;
  settle: (value: TResult) => void;
  abort: (status?: OverlayAbortStatus) => void;
}