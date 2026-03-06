<script lang="ts">
import ContextMenuMain from "./context-menu/ContextMenuMain.svelte";
import RecursiveCardsMain from "./recursive-cards/RecursiveCardsMain.svelte";
</script>

<div class="content">
  <!-- <RecursiveCardsMain /> -->
  <ContextMenuMain />
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