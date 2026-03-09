<script lang="ts">
import useNewEventTarget from "./useNewEventTarget";
import ComponentTesterMain from "./ComponentTesterMain.svelte";
import Toaster from "../toast/Toaster.svelte";
import "./app.css";
import OverlayProvider from "../overlayv2/OverlayProvider.svelte";

useNewEventTarget();
</script>

<OverlayProvider>
  <main>
    <ComponentTesterMain />
  </main>
</OverlayProvider>
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
