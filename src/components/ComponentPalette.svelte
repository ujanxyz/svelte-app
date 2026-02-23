<script lang="ts">
  import PaletteItem from "./PaletteItem.svelte"
</script>

<div class="palette">
  <PaletteItem type="text"/>
  <PaletteItem type="rect"/>
  <PaletteItem type="circle"/>
</div>

<style>
.palette {
  width: 100px;
  border-right: 1px solid #444;
}
</style>
