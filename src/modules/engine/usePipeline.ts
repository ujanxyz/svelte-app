import { onMount, onDestroy } from "svelte"
import WasmPipelineService from "./WasmPipelineService"

export function usePipeline() {

  let pipelineId: number


  onMount(async () => {

    await WasmPipelineService.initialize()

    pipelineId = WasmPipelineService.createPipeline()

    console.log("Pipeline created:", pipelineId)

    // example test call
    WasmPipelineService.evaluate(pipelineId)
  })


  onDestroy(() => {

    WasmPipelineService.destroyPipeline(pipelineId)

    console.log("Pipeline destroyed:", pipelineId)
  })


  return {

    getPipelineId: () => pipelineId
  }
}
