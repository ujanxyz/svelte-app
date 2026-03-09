<script lang="ts">
import { setContext } from "svelte";
import { SvelteFlowProvider } from "@xyflow/svelte";
import XYFlowGraph from "./XYFlowGraph.svelte";
import { CONTXT_KEY_XY_ACTIONS } from "./constants";
import RegisterEventHandlers from "./RegisterEventHandlers.svelte";
import type { XYActions } from "./types";
import MenusAndPopups from "./MenusAndPopups.svelte";

setContext(CONTXT_KEY_XY_ACTIONS, { name: "XYActions" } as XYActions);
</script>

<SvelteFlowProvider>
  <XYFlowGraph />
  <!-- <RegisterXYMenus /> -->
  <!-- <RegisterXYGalleries /> -->
  <RegisterEventHandlers />
  <MenusAndPopups />
</SvelteFlowProvider>
