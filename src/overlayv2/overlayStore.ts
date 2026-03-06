import { writable, type Unsubscriber, type Writable } from "svelte/store";
import type {
  LayerSnippetFn,
  DescendantUse,
  OverlayEntry,
  CreatorUse,
  ResolveFn,
  StatusOr,
} from "./types";
import { ReturnStatus } from "./constants";

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

  // Remove layer(s) from a matching one onwards till end, returns the removed ones.
  // if not found, removes everything (safely remove all overlays in case of this
  // unexpected scenario).
  function popFromMatching(
    select: (elem: OverlayEntry) => boolean,
  ): OverlayEntry[] {
    const removed: OverlayEntry[] = [];
    layers.update((entries: OverlayEntry[]): OverlayEntry[] => {
      const index = entries.findIndex(select);
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

  function popAll(): OverlayEntry[] {
    const removed: OverlayEntry[] = [];
    layers.update((entries: OverlayEntry[]): OverlayEntry[] => {
      removed.push(...entries);
      return [];
    });
    return removed;
  }

  return { pushLayer, popLayer, popFromMatching, popAll };
}

//--------------------------------------------------------------------------------------------------
function _makeConsumerUse(
  layerSymId: symbol,
  ops: ReturnType<typeof _makeOverlayOps>,
): DescendantUse {
  const isCurrentLayer = (e: OverlayEntry): boolean => e.symId === layerSymId;

  // Separate the first (must also match the predicate) from the rest.
  function _seggregate(elems: OverlayEntry[]): {
    first: OverlayEntry | undefined;
    rest: OverlayEntry[];
  } {
    if (elems.length === 0 || !isCurrentLayer(elems[0])) {
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
    const { first, rest } = _seggregate(ops.popFromMatching(isCurrentLayer));
    _abortLayers(rest);
    if (!!first) {
      first.resolve(value);
    }
  }

  function abortOverlay(customStatus?: string) {
    const { first, rest } = _seggregate(ops.popFromMatching(isCurrentLayer));
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
    const removed = overlayOps.popAll();
    if (removed.length === 0) return;
    const error = new BulkAbortedError("Overlays canceled");
    while (removed.length > 0) {
      (removed.pop() as OverlayEntry).reject(error);
    }
  }

  return { pushOverlay, subscribeStackChange, clearOverlays, overlayOps };
})();

//--------------------------------------------------------------------------------------------------
function useOverlayUi(renderfn: LayerSnippetFn): CreatorUse & DescendantUse {
  const { overlayOps } = overlayStore;
  let lastUse: DescendantUse | undefined = undefined;

  function _validErrorToStatus<T>(reason: any): StatusOr<T> {
    if (reason instanceof SelfAbortedError) {
      const customStatus = (reason as SelfAbortedError).customStatus;
      return { status: customStatus ?? ReturnStatus.SELF_ABORTED, reason };
    } else if (reason instanceof ParentAbortedError) {
      return { status: ReturnStatus.SELF_ABORTED, reason };
    }
    throw reason;
  }

  async function openOverlayAsync<T>(): Promise<StatusOr<T>> {
    const promise = new Promise<T>((resolve: ResolveFn<T>, reject) => {
      const symId = Symbol(); // A new unique symbol for this layer instance.
      const descendantUse: DescendantUse = _makeConsumerUse(symId, overlayOps);

      const entry: OverlayEntry = {
        resolve: resolve as ResolveFn<unknown>,
        reject,
        renderfn,
        symId,
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
