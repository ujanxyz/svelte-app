<script lang="ts">
  import useNewEventTarget from './useNewEventTarget';
  import ScreenLayout from './ScreenLayout.svelte';
  import './app.css';

  useNewEventTarget();
</script>

<main>
    <ScreenLayout />
</main>

<style>
main {
  margin: 0;
  padding: 0;
}
</style>
