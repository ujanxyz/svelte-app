import { getContext } from "svelte";

import { OVERLAY_INSTANCE_CONTEXT } from "./constants";
import type { OverlayInstance } from "./types";

const noOverlayError =
  "Overlay instance not found. This hook must be called from inside overlay content opened by the library.";

export function useOverlayInstance<TPayload, TResult>(): OverlayInstance<
  TPayload,
  TResult
> {
  const instance = getContext<OverlayInstance<TPayload, TResult> | undefined>(
    OVERLAY_INSTANCE_CONTEXT,
  );

  if (!instance) {
    throw new Error(noOverlayError);
  }

  return instance;
}