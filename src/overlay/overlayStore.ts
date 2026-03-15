import { type Unsubscriber, type Writable, writable } from "svelte/store";

import { ReturnStatus } from "./constants";
import type {
  CreatorUse,
  DescendantUse,
  LayerPayload,
  LayerSnippetFn,
  OverlayEntry,
  ResolveFn,
  StatusOr,
} from "./types";

class SelfAbortedError extends Error {
  customStatus?: string;
  constructor(message: string, customStatus?: string) {
    super(message);
    this.name = "SelfAbortedError";
    this.customStatus = customStatus;
  }
}

class BulkAbortedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BulkAbortedError";
  }
}

class ParentAbortedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParentAbortedError";
  }
}

//--------------------------------------------------------------------------------------------------
function _makeOverlayOps(layers: Writable<OverlayEntry[]>) {
  // Push a new overlay layer.
  function pushLayer(newElem: OverlayEntry): void {
    layers.update((elems: OverlayEntry[]): OverlayEntry[] => {
      return [...elems, newElem];
    });
  }

  // Pop the topmost overlay layer.
  function popLayer(): OverlayEntry | undefined {
    let last: OverlayEntry | undefined = undefined;
    layers.update((entries: OverlayEntry[]): OverlayEntry[] => {
      if (entries.length === 0) return [];
      last = entries.pop() as OverlayEntry;
      return [...entries];
    });
    return last;
  }

  // Remove layer(s) from a given id onwards till end, and return the removed ones.
  // If not found, removes everything (safely remove all layers in case of this
  // unexpected scenario).
  function popFromLayerId(fromLayerId: string): OverlayEntry[] {
    const removed: OverlayEntry[] = [];
    layers.update((entries: OverlayEntry[]): OverlayEntry[] => {
      const index = entries.findIndex(
        (layer: OverlayEntry) => layer.layerId === fromLayerId,
      );
      if (index < 0) {
        removed.push(...entries);
        return [];
      }
      removed.push(...entries.slice(index));
      while (entries.length > index) {
        entries.pop();
      }
      return [...entries];
    });
    return removed;
  }

  function popAllLayers(): OverlayEntry[] {
    const removed: OverlayEntry[] = [];
    layers.update((entries: OverlayEntry[]): OverlayEntry[] => {
      removed.push(...entries);
      return [];
    });
    return removed;
  }

  return { pushLayer, popLayer, popFromLayerId, popAllLayers };
}

//--------------------------------------------------------------------------------------------------
function _makeConsumerUse(
  currentLayerId: string,
  ops: ReturnType<typeof _makeOverlayOps>,
): DescendantUse {
  // Separate the first (must also match the predicate) from the rest.
  function _seggregate(elems: OverlayEntry[]): {
    first: OverlayEntry | undefined;
    rest: OverlayEntry[];
  } {
    if (elems.length === 0 || elems[0].layerId !== currentLayerId) {
      return { first: undefined, rest: [...elems] };
    }
    const [first, ...rest] = elems;
    return { first, rest };
  }

  function _abortLayers(elems: OverlayEntry[]): void {
    while (elems.length > 0) {
      const error = new ParentAbortedError(
        `Aborted ${elems.length} layer(s) below`,
      );
      (elems.pop() as OverlayEntry).reject(error);
    }
  }

  function settleOverlay<T>(value: T) {
    const { first, rest } = _seggregate(ops.popFromLayerId(currentLayerId));
    _abortLayers(rest);
    if (!!first) {
      first.resolve(value);
    }
  }

  function abortOverlay(customStatus?: string) {
    const { first, rest } = _seggregate(ops.popFromLayerId(currentLayerId));
    _abortLayers(rest);
    if (!!first) {
      const error = new SelfAbortedError("Aborted from overlay", customStatus);
      first.reject(error);
    }
  }

  return { settleOverlay, abortOverlay };
}

//--------------------------------------------------------------------------------------------------
const overlayStore = (function () {
  const stack = writable<OverlayEntry[]>([]);
  const overlayOps = _makeOverlayOps(stack);

  function pushOverlay(newEntry: OverlayEntry): DescendantUse {
    overlayOps.pushLayer(newEntry);
    return newEntry.descendantUse;
  }

  function subscribeStackChange(
    subscribeFn: (entries: OverlayEntry[]) => void,
  ): Unsubscriber {
    return stack.subscribe(subscribeFn);
  }

  function clearOverlays(): void {
    const removed = overlayOps.popAllLayers();
    if (removed.length === 0) return;
    const error = new BulkAbortedError("Overlays canceled");
    while (removed.length > 0) {
      (removed.pop() as OverlayEntry).reject(error);
    }
  }

  // Clear all layers from the given layer id (inclusive).
  function clearLayersFrom(layerId: string): void {
    const removed = overlayOps.popFromLayerId(layerId);
    if (removed.length === 0) return;
    const error = new BulkAbortedError("Overlays canceled");
    while (removed.length > 0) {
      (removed.pop() as OverlayEntry).reject(error);
    }
  }

  return {
    pushOverlay,
    subscribeStackChange,
    clearOverlays,
    clearLayersFrom,
    overlayOps,
  };
})();

//--------------------------------------------------------------------------------------------------
function useOverlayUi(renderfn: LayerSnippetFn): CreatorUse & DescendantUse {
  const { overlayOps } = overlayStore;
  let lastUse: DescendantUse | undefined = undefined;

  function _validErrorToStatus<T>(reason: any): StatusOr<T> {
    if (reason instanceof SelfAbortedError) {
      const customStatus = (reason as SelfAbortedError).customStatus;
      return { status: customStatus ?? ReturnStatus.SELF_ABORTED, reason };
    } else if (reason instanceof BulkAbortedError) {
      return { status: ReturnStatus.BULK_ABORTED, reason };
    } else if (reason instanceof ParentAbortedError) {
      return { status: ReturnStatus.PARENT_ABORTED, reason };
    }

    throw reason;
  }

  async function openOverlayAsync<T>(
    payload: LayerPayload,
  ): Promise<StatusOr<T>> {
    const promise = new Promise<T>((resolve: ResolveFn<T>, reject) => {
      const layerId = crypto.randomUUID();
      const descendantUse: DescendantUse = _makeConsumerUse(
        layerId,
        overlayOps,
      );

      const entry: OverlayEntry = {
        layerId,
        payload,
        renderfn,
        resolve: resolve as ResolveFn<unknown>,
        reject,
        descendantUse: descendantUse,
      };
      overlayStore.pushOverlay(entry);
      // TODO: Subscribe to close, and there set lastUse = undefined.
      lastUse = descendantUse;
    });
    return promise
      .then((value: T) => ({ status: ReturnStatus.OK, value }))
      .catch(_validErrorToStatus<T>);
  }

  function settleOverlay<T>(value: T): void {
    lastUse?.settleOverlay(value);
  }

  function abortOverlay(customStatus?: string): void {
    lastUse?.abortOverlay(customStatus);
  }

  return { openOverlayAsync, settleOverlay, abortOverlay };
}

export { useOverlayUi };
export default overlayStore;
