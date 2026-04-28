import type { Snippet } from "svelte";

import { overlayStatuses } from "./constants";
import { withOverlayDefaults } from "./manager";
import type {
  OverlayAbortStatus,
  OverlayController,
  OverlayManager,
  OverlayOptions,
  OverlayResult,
} from "./types";
import { useOverlayManager } from "./useOverlayManager";

export function createOverlayController<TPayload, TResult>(
  manager: OverlayManager,
  render: Snippet<[]>,
): OverlayController<TPayload, TResult> {
  let lastOpenedId: string | null = null;

  return {
    open(
      payload: TPayload,
      options?: Partial<OverlayOptions>,
    ): Promise<OverlayResult<TResult>> {
      const handle = manager.open(
        withOverlayDefaults<TPayload, TResult>({
          payload,
          options,
          render,
        }),
      );

      lastOpenedId = handle.id;
      void handle.promise.finally(() => {
        if (lastOpenedId === handle.id) {
          lastOpenedId = null;
        }
      });

      return handle.promise;
    },

    settle(value: TResult): void {
      if (!lastOpenedId) {
        return;
      }

      manager.settle(lastOpenedId, value);
      lastOpenedId = null;
    },

    abort(status: OverlayAbortStatus = overlayStatuses.ABORTED): void {
      if (!lastOpenedId) {
        return;
      }

      manager.abort(lastOpenedId, status);
      lastOpenedId = null;
    },
  };
}

export function useOverlayController<TPayload, TResult>(
  render: Snippet<[]>,
): OverlayController<TPayload, TResult> {
  return createOverlayController<TPayload, TResult>(useOverlayManager(), render);
}