import type { PipelineAPI } from "../types/PipelineAPI"

class WasmPipelineService implements PipelineAPI {
  private static instance: WasmPipelineService | null = null
  private initialized = false

  // you may store your wasm module here
  private wasm: any = null


  static getInstance(): WasmPipelineService {

    if (!WasmPipelineService.instance)
      WasmPipelineService.instance = new WasmPipelineService()

    return WasmPipelineService.instance
  }


  async initialize(): Promise<void> {

    if (this.initialized)
      return

    console.log("Initializing WASM pipeline service...")

    // YOU IMPLEMENT:
    // call your custom init function here
    //
    // example:
    //
    // this.wasm = await MyCustomInit()
    //
    // or
    //
    // this.wasm = await initPipelineWasm()

    this.initialized = true
  }


  createPipeline(): number {

    console.log("createPipeline called")

    // YOU IMPLEMENT

    return 0
  }


  destroyPipeline(pipelineId: number): void {

    console.log("destroyPipeline", pipelineId)

    // YOU IMPLEMENT
  }


  addNode(pipelineId: number, node: any): number {

    console.log("addNode", pipelineId, node)

    // YOU IMPLEMENT

    return 0
  }


  addEdge(pipelineId: number, edge: any): void {

    console.log("addEdge", pipelineId, edge)

    // YOU IMPLEMENT
  }


  getGraph(pipelineId: number): any {

    console.log("getGraph", pipelineId)

    // YOU IMPLEMENT

    return {}
  }


  evaluate(pipelineId: number): any {

    console.log("evaluate", pipelineId)

    // YOU IMPLEMENT

    return {}
  }


  reset(): void {

    console.log("reset called")

    // YOU IMPLEMENT
  }
}


export default WasmPipelineService.getInstance()
