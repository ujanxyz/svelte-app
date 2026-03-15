import { getContext } from "svelte";

import { LAYER_CONTEXT_KEY } from "./constants";
import type { LayerUse } from "./types";

const kNoContextErr =
  "Overlay context not found. Was the UI launched via openOverlayAsync ?";

function useCurrentOverlay(): LayerUse {
  const useContext = getContext(LAYER_CONTEXT_KEY) as LayerUse;
  if (!useContext) {
    throw new Error(kNoContextErr);
  }
  return useContext;
}

export default useCurrentOverlay;
