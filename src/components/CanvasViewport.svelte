<script lang="ts">

  import { onMount } from "svelte"
  import DragDropManager from "../utils/DragDropManager"
  import { canvasStore } from "../stores/canvasStore"
  import { renderCanvas } from "../utils/CanvasRenderer"
  import { usePipeline } from "../utils/usePipeline"

  let canvas: HTMLCanvasElement

  let ctx: CanvasRenderingContext2D

  let components = []

  usePipeline()


  canvasStore.subscribe(v => {

    components = v

    if (ctx)
      renderCanvas(ctx, components)
  })


  onMount(() => {

    ctx = canvas.getContext("2d")!
  })


  function onDrop(event: DragEvent) {

    event.preventDefault()

    const data = DragDropManager.getDragData(event)

    if (!data)
      return

    canvasStore.addComponent({

      id: crypto.randomUUID(),

      type: data.type,

      x: event.offsetX,
      y: event.offsetY,

      width: 100,
      height: 100,

      props: {}
    })
  }


  function onDragOver(event: DragEvent) {

    event.preventDefault()
  }

</script>


<canvas

  bind:this={canvas}

  width="800"
  height="600"

  on:drop={onDrop}
  on:dragover={onDragOver}

  style="border:1px solid #444"
>
</canvas>
