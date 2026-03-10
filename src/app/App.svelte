<script lang="ts">
import useNewEventTarget from "./useNewEventTarget";
import ComponentTesterMain from "./ComponentTesterMain.svelte";
import "./app.css";
import OverlayProvider from "../overlay/OverlayProvider.svelte";
import Toaster from "../modules/toast/Toaster.svelte";
import MemLogger from "../modules/memlogging/MemLogger.svelte";

useNewEventTarget();
</script>

<OverlayProvider>
  <main>
    <ComponentTesterMain />
  </main>
</OverlayProvider>
<MemLogger />
<Toaster />

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
