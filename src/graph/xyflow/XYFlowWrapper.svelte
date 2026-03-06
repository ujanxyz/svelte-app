<script lang="ts">
import { SvelteFlowProvider } from "@xyflow/svelte";
import XYFlowGraph from "./XYFlowGraph.svelte";
import RegisterXYMenus from "./RegisterXYMenus.svelte";
import RegisterXYGalleries from "./RegisterXYGalleries.svelte";
import RegisterEventHandlers from "./RegisterEventHandlers.svelte";
</script>

<SvelteFlowProvider>
  <XYFlowGraph />
  <RegisterXYMenus />
  <RegisterXYGalleries />
  <RegisterEventHandlers />
</SvelteFlowProvider>
