<script lang="ts">
import "./app.css";

import MemLogger from "@/modules/memlogging/MemLogger.svelte";
import Toaster from "@/modules/toast/Toaster.svelte";
import OverlayProvider from "@/overlay/OverlayProvider.svelte";
import PipelineBuilderProvider from "@/webworkerclient/PipelineBuilderProvider.svelte";

import ComponentTesterMain from "./ComponentTesterMain.svelte";
import useNewEventTarget from "./useNewEventTarget";

useNewEventTarget();
</script>

<PipelineBuilderProvider>
  <OverlayProvider>
    <main>
      <ComponentTesterMain />
    </main>
  </OverlayProvider>
  <MemLogger />
  <Toaster />
</PipelineBuilderProvider>

<style>
main {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  margin: 0;
  padding: 0;
}
</style>
