import { WorkerIndexedDb } from "./db";
import { PipelineEventsHandler } from "./PipelineEventsHandler";

type IoProcessResult = Record<string, any>;

class WorkerIoManager {
  private readonly cmdPrefix: string = "IO:";
  private readonly pipelineEvents: EventTarget;
  private readonly plEventsHandler: PipelineEventsHandler;
  private readonly indexedDb: WorkerIndexedDb;

  public constructor(pipelineEvents: EventTarget) {
    this.pipelineEvents = pipelineEvents;
    this.plEventsHandler = new PipelineEventsHandler();
    this.plEventsHandler.setUpListeners(pipelineEvents);
    this.indexedDb = new WorkerIndexedDb({ idleCloseMs: 60_000 });
  }

  public async process(code: string, request: any): Promise<Error | IoProcessResult> {
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
        return { status: "OK", message: "Canvas registered" };
      }
      case "SEND_FILE": {
        console.log("Sending file with request:", request);
        const { file } = request as { file: File };
        console.log("Received file:", file);
        this.pipelineEvents.dispatchEvent(new CustomEvent("FILE_UPLOADED", { detail: { file } }));
        console.log("Dispatched FILE_UPLOADED event for file:", file);
        const meta = await this.indexedDb.putFile(file);
        console.log("File stored with meta:", meta);
        return { status: "OK", message: "File received", meta };

      }
      case "LIST_FILES": {
        const files = await this.indexedDb.listFiles();
        return { status: "OK", message: "Files listed", files };
      }
      case "DELETE_FILE": {
        const { filename } = request as { filename: string };
        const deleted = await this.indexedDb.deleteFile(filename);
        return {
          status: "OK",
          message: "File delete attempted",
          filename,
          deleted,
        };
      }
      default:
        throw new Error("Unknown IO command: " + ioCmd);
    }
  }
};

interface FileToImageDataResult {
  width: number;
  height: number;
  numBytes: number;
  data: Uint8ClampedArray;
}

export { WorkerIoManager };
