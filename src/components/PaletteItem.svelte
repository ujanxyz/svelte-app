<script lang="ts">
  import DragDropManager from "../utils/DragDropManager"

  const { type = "rect" } = $props<{ type?: string }>();

  function onDragStart(event: DragEvent) {
    DragDropManager.startDrag(event, { type })
  }
</script>


<div draggable="true" ondragstart={onDragStart} class="palette-item">
  {type}
</div>


<style>

.palette-item {

  padding: 8px;
  border: 1px solid #666;
  margin: 4px;
  cursor: grab;
}

</style>
