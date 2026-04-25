import { PipelineEventsHandler } from "./PipelineEventsHandler";

class WorkerIoManager {
  private readonly cmdPrefix: string = "IO:";
  private readonly plEventsHandler: PipelineEventsHandler;

  public constructor(pipelineEvents: EventTarget) {
    this.plEventsHandler = new PipelineEventsHandler();
    this.plEventsHandler.setUpListeners(pipelineEvents);
  }

  public async process(code: string, request: any): Promise<Error | Record<string, any>> {
    if (!code.startsWith(this.cmdPrefix)) {
      throw new Error("Invalid code: " + code);
    }
    const ioCmd: string = code.substring(this.cmdPrefix.length);
    switch (ioCmd) {
      case "REGISTER_CANVAS": {
        console.log("Registering canvas with request:", request);
        const {rawNodeId, slotName, canvas} = request as { rawNodeId: number, slotName: string, canvas: OffscreenCanvas };
        const bitmapId = `${rawNodeId}:${slotName}`;
        this.plEventsHandler.registerPreview(bitmapId, canvas);
        return { status: "Canvas registered" };
      }
      default:
        throw new Error("Unknown IO command: " + ioCmd);
    }
  }
};



export { WorkerIoManager };
