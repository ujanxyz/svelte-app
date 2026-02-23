export interface DragData {

  type: string
}


class DragDropManager {

  static startDrag(event: DragEvent, data: DragData) {

    event.dataTransfer?.setData(
      "application/json",
      JSON.stringify(data)
    )
  }


  static getDragData(event: DragEvent): DragData | null {

    const raw = event.dataTransfer?.getData("application/json")

    if (!raw)
      return null

    return JSON.parse(raw)
  }
}


export default DragDropManager
