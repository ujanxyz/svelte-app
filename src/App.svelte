<script lang="ts">
  import useNewEventTarget from './app/useNewEventTarget';
  import logo from './assets/svelte.svg';
  import CanvasViewport from './components/CanvasViewport.svelte';
  import ComponentPalette from './components/ComponentPalette.svelte';
  import ScreenLayout from './components/ScreenLayout.svelte';

  useNewEventTarget();
</script>

<main>
    <ScreenLayout />
  <!-- <div>
    <ComponentPalette />
    <CanvasViewport />
  </div> -->
</main>

<style>
main {
  margin: 0;
  padding: 0;
}
</style>
