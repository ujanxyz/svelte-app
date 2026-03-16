<script lang="ts">
import "./app.css";

import WorkerClientUse from "@/modules/workerclient/WorkerClientUse.svelte";

import MemLogger from "../modules/memlogging/MemLogger.svelte";
import Toaster from "../modules/toast/Toaster.svelte";
import OverlayProvider from "../overlay/OverlayProvider.svelte";
import ComponentTesterMain from "./ComponentTesterMain.svelte";
import useNewEventTarget from "./useNewEventTarget";

useNewEventTarget();
</script>

<OverlayProvider>
  <main>
    <ComponentTesterMain />
  </main>
</OverlayProvider>
<MemLogger />
<Toaster />
<WorkerClientUse />

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
