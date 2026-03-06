<script lang="ts">
import useNewEventTarget from "./useNewEventTarget";
import ScreenLayout from "./ScreenLayout.svelte";
import "./app.css";
import OverlayProvider from "../overlayv2/OverlayProvider.svelte";

useNewEventTarget();
</script>

<OverlayProvider>
  <main>
    <ScreenLayout />
  </main>
</OverlayProvider>

<style>
main {
  margin: 0;
  padding: 0;
}
</style>
