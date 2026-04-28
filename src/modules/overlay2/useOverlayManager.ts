import { getContext } from "svelte";

import { OVERLAY_MANAGER_CONTEXT } from "./constants";
import type { OverlayManager } from "./types";

const noManagerError =
  "Overlay manager not found. Wrap the caller with <OverlayRoot> or pass a manager explicitly.";

export function useOverlayManager(): OverlayManager {
  const manager = getContext<OverlayManager | undefined>(OVERLAY_MANAGER_CONTEXT);
  if (!manager) {
    throw new Error(noManagerError);
  }

  return manager;
}
