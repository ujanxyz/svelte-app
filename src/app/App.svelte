<script lang="ts">
import useNewEventTarget from "./useNewEventTarget";
import OverlayProvider from "../overlayv2/OverlayProvider.svelte";
import OverlayTesterMain from "../overlayv2/OverlayTesterMain.svelte";
import Toaster from "../toast/Toaster.svelte";
import "./app.css";

useNewEventTarget();

</script>

<OverlayProvider>
  <main>
    <OverlayTesterMain />
  </main>
</OverlayProvider>
<Toaster />

<style>
main {
  margin: 0;
  padding: 0;
}
</style>
