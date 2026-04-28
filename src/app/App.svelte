<script lang="ts">
import "./app.css";

import MemLogger from "@/modules/memlogging/MemLogger.svelte";
import Toaster from "@/modules/toast/Toaster.svelte";
import { createOverlayManager, OverlayRoot } from "@/modules/overlay2";
import WorkerResourcesProvider from "@/webworkerclient/WorkerResourcesProvider.svelte";

import ComponentTesterMain from "./ComponentTesterMain.svelte";
import useNewEventTarget from "./useNewEventTarget";

const overlayManager = createOverlayManager();

useNewEventTarget();
</script>

<WorkerResourcesProvider>
  <!-- <OverlayProvider> -->
  <OverlayRoot manager={overlayManager}>
    <main>
      <ComponentTesterMain />
    </main>
  </OverlayRoot>
  <!-- </OverlayProvider> -->
  <MemLogger />
  <Toaster />
</WorkerResourcesProvider>


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
