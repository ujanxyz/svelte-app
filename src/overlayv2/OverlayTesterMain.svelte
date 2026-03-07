<script lang="ts">
import ContextMenuMain from "./context-menu/ContextMenuMain.svelte";
import LocalPopupsMain from "./local-popups/LocalPopupsMain.svelte";
import RecursiveCardsMain from "./recursive-cards/RecursiveCardsMain.svelte";
</script>

<div class="content">
  <!-- <RecursiveCardsMain /> -->
  <!-- <ContextMenuMain /> -->
  <LocalPopupsMain />
</div>

<style>
.content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
