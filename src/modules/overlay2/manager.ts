import { get, writable } from "svelte/store";

import { defaultOverlayOptions, overlayStatuses } from "./constants";
import { isOverlayAbortError,OverlayAbortError } from "./errors";
import type {
  OverlayAbortStatus,
  OverlayEntry,
  OverlayHandle,
  OverlayManager,
  OverlayOptions,
  OverlayRequest,
  OverlayResult,
} from "./types";

function normalizeOptions(options?: Partial<OverlayOptions>): OverlayOptions {
  return {
    ...defaultOverlayOptions,
    ...(options ?? {}),
  };
}

function toResult<TResult>(value: TResult): OverlayResult<TResult> {
  return {
    status: overlayStatuses.OK,
    value,
  };
}

function toFailure<TResult>(reason: unknown): OverlayResult<TResult> {
  if (isOverlayAbortError(reason)) {
    return {
      status: reason.status,
      reason,
    };
  }

  throw reason;
}

class OverlayManagerImpl implements OverlayManager {
  readonly #entries = writable<OverlayEntry[]>([]);

  subscribe = this.#entries.subscribe;

  open<TPayload, TResult>(
    request: OverlayRequest<TPayload, TResult>,
  ): OverlayHandle<TResult> {
    const id = crypto.randomUUID();
    console.log("Opening overlay with ID:", id, "and payload:", request.payload);

    let settleCurrent!: (value: TResult) => void;
    let abortCurrent!: (reason: unknown) => void;

    const pending = new Promise<TResult>((resolve, reject) => {
      settleCurrent = resolve;
      abortCurrent = reject;
    });

    const promise = pending.then(toResult<TResult>).catch(toFailure<TResult>);

    this.#entries.update((entries) => {
      return [
        ...entries,
        {
          id,
          payload: request.payload,
          options: request.options,
          render: request.render,
          resolve: settleCurrent as (value: unknown) => void,
          reject: abortCurrent,
        },
      ];
    });

    return {
      id,
      promise,
      settle: (value) => {
        this.settle(id, value);
      },
      abort: (status = overlayStatuses.ABORTED) => {
        this.abort(id, status);
      },
    };
  }

  settle<TResult>(id: string, value: TResult): void {
    const removed = this.#removeFrom(id);
    if (removed.length === 0) {
      return;
    }

    const [current, ...descendants] = removed;
    this.#abortRemoved(descendants, overlayStatuses.PARENT_ABORTED);
    (current as OverlayEntry<unknown, TResult>).resolve(value);
  }

  abort(id: string, status: OverlayAbortStatus = overlayStatuses.ABORTED): void {
    const removed = this.#removeFrom(id);
    if (removed.length === 0) {
      return;
    }

    const [current, ...descendants] = removed;
    current.reject(new OverlayAbortError(status));
    this.#abortRemoved(descendants, overlayStatuses.PARENT_ABORTED);
  }

  abortTop(status: OverlayAbortStatus = overlayStatuses.DISMISSED): void {
    const top = get(this.#entries).at(-1);
    if (!top) {
      return;
    }

    this.abort(top.id, status);
  }

  abortAll(status: OverlayAbortStatus = overlayStatuses.DISMISSED): void {
    const removed = this.#drain();
    if (removed.length === 0) {
      return;
    }

    for (const entry of removed) {
      entry.reject(new OverlayAbortError(status));
    }
  }

  #removeFrom(id: string): OverlayEntry[] {
    const removed: OverlayEntry[] = [];

    this.#entries.update((entries) => {
      const index = entries.findIndex((entry) => entry.id === id);
      if (index < 0) {
        return entries;
      }

      removed.push(...entries.slice(index));
      return entries.slice(0, index);
    });

    return removed;
  }

  #drain(): OverlayEntry[] {
    const removed: OverlayEntry[] = [];

    this.#entries.update((entries) => {
      removed.push(...entries);
      return [];
    });

    return removed;
  }

  #abortRemoved(
    entries: OverlayEntry[],
    status: OverlayAbortStatus,
  ): void {
    for (const entry of entries) {
      entry.reject(new OverlayAbortError(status));
    }
  }
}

let managerCreatedOnce = false;
export function createOverlayManager(): OverlayManager {
  if (managerCreatedOnce) {
    throw new Error("OverlayManager has already been created.");
  }
  managerCreatedOnce = true;
  return new OverlayManagerImpl();
}

export function withOverlayDefaults<TPayload, TResult>(
  request: Omit<OverlayRequest<TPayload, TResult>, "options"> & {
    options?: Partial<OverlayOptions>;
  },
): OverlayRequest<TPayload, TResult> {
  return {
    ...request,
    options: normalizeOptions(request.options),
  };
}