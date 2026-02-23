import { writable } from "svelte/store"
import type { CanvasComponent } from "../types/ComponentTypes"

function createCanvasStore() {

  const { subscribe, update, set } = writable<CanvasComponent[]>([])

  return {

    subscribe,

    addComponent(component: CanvasComponent) {

      update(list => {

        return [...list, component]
      })
    },

    clear() {

      set([])
    }
  }
}

export const canvasStore = createCanvasStore()
