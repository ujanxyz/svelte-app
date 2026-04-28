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
      case "SEND_FILE": {
        console.log("Sending file with request:", request);
        const { file } = request as { file: File };
        console.log("Received file in worker:", file);
        console.log("TODO: Save in db");
        // Handle file sending logic here
        return { status: "File sent" };
      }
      default:
        throw new Error("Unknown IO command: " + ioCmd);
    }
  }
};



export { WorkerIoManager };
