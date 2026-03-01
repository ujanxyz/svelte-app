<script lang="ts">
  import useNewEventTarget from './app/useNewEventTarget';
  import ScreenLayout from './app/ScreenLayout.svelte';

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
