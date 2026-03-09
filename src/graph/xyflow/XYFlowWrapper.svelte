<script lang="ts">
import { getContext, setContext } from "svelte";
import { SvelteFlowProvider } from "@xyflow/svelte";
import XYFlowGraph from "./XYFlowGraph.svelte";
import { CONTXT_KEY_XY_ACTIONS } from "./constants";
import RegisterXYMenus from "./RegisterXYMenus.svelte";
import RegisterXYGalleries from "./RegisterXYGalleries.svelte";
import RegisterEventHandlers from "./RegisterEventHandlers.svelte";
import type { XYActions } from "./types";
import ContextMenus from "./ContextMenus.svelte";

setContext(CONTXT_KEY_XY_ACTIONS, { name: "XYActions" } as XYActions);
</script>

<SvelteFlowProvider>
  <XYFlowGraph />
  <!-- <RegisterXYMenus /> -->
  <!-- <RegisterXYGalleries /> -->
  <ContextMenus />
  <RegisterEventHandlers />
</SvelteFlowProvider>
