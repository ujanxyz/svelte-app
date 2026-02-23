import type { CanvasComponent } from "../types/ComponentTypes"


export function renderCanvas(

  ctx: CanvasRenderingContext2D,
  components: CanvasComponent[]

) {

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)


  for (const c of components) {

    switch (c.type) {

      case "rect":

        ctx.fillStyle = "red"

        ctx.fillRect(
          c.x,
          c.y,
          c.width,
          c.height
        )

        break


      case "circle":

        ctx.beginPath()

        ctx.arc(
          c.x,
          c.y,
          c.width,
          0,
          Math.PI * 2
        )

        ctx.fillStyle = "blue"

        ctx.fill()

        break


      case "text":

        ctx.fillStyle = "white"

        ctx.fillText(
          "Text",
          c.x,
          c.y
        )

        break
    }
  }
}
