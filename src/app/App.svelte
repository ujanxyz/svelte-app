<script lang="ts">
import "./styles/index.css";

import MemLogger from "@/modules/memlogging/MemLogger.svelte";
import { createOverlayManager, OverlayRoot } from "@/modules/overlay2";
import Toaster from "@/modules/toast/Toaster.svelte";
import WorkerResourcesProvider from "@/webworkerclient/WorkerResourcesProvider.svelte";

import AppTopBar from "./AppTopBar.svelte";
import ComponentTesterMain from "./ComponentTesterMain.svelte";
import useNewEventTarget from "./useNewEventTarget";

const overlayManager = createOverlayManager();

useNewEventTarget();
</script>

<WorkerResourcesProvider>
  <OverlayRoot manager={overlayManager}>
    <div class="app-shell">
      <AppTopBar />
      <main>
        <ComponentTesterMain />
      </main>
    </div>
  </OverlayRoot>
  <MemLogger />
  <Toaster />
</WorkerResourcesProvider>


<style>
 .app-shell {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

main {
  flex: 1 1 0%;
  min-height: 0;
  position: relative;
  margin: 0;
  padding: 0;
}
</style>
