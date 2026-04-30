
interface PreviewEntry {
  offscreen: OffscreenCanvas;
};

interface GraphicEntry {
  width: number;
  height: number;
  numBytes: number;
  uint8arr: Uint8ClampedArray; 
};

interface BitmapCreatedMessage {
  id: string;
  width: number;
  height: number;
  numBytes: number;
  uint8arr: Uint8ClampedArray;
};

const EventCodes = Object.freeze({
  BITMAP_CREATED: "BITMAP_CREATED",
  BITMAP_DELETED: "BITMAP_DELETED",
  BITMAP_FLUSHED: "BITMAP_FLUSHED",
  FILE_UPLOADED: "FILE_UPLOADED",
});

// This class maanges a collection of graphics (bitmap, video etc), and a collection of preview canvases.
// There is a mapping from graphic id to one or more preview canvases that are currently showing that graphic.
class PipelineEventsHandler {
  private readonly previews: Map<string /* preview slot id */, PreviewEntry> = new Map();
  private readonly graphics: Map<string /* graphic id */, GraphicEntry> = new Map();


  public constructor() {
  }

  public setUpListeners(eventTarget: EventTarget): void {
    eventTarget.addEventListener(EventCodes.BITMAP_CREATED, this.#onBitmapCreated.bind(this));
    eventTarget.addEventListener(EventCodes.BITMAP_DELETED, this.#onBitmapDeleted.bind(this));
    eventTarget.addEventListener(EventCodes.BITMAP_FLUSHED, this.#onBitmapFlushed.bind(this));
    eventTarget.addEventListener(EventCodes.FILE_UPLOADED, this.#onFileUploaded.bind(this));
  }

  public registerPreview(previewId: string, canvas: OffscreenCanvas): void {
    drawOnCanvas(canvas);

    let entry = this.previews.get(previewId);
    if (entry) {
      throw new Error(`Preview with id ${previewId} already exists.`);
    }
    entry = { offscreen: canvas };
    this.previews.set(previewId, entry);
  }

  public unregisterPreview(previewId: string): void {
    const entry = this.previews.get(previewId);
    if (!entry) {
      throw new Error(`Preview with id ${previewId} does not exist.`);
    }
    this.previews.delete(previewId);
  }

  #onBitmapCreated(ev: Event): void {
    const {id: bitmapId, width, height, numBytes, uint8arr} = (ev as CustomEvent).detail as BitmapCreatedMessage;
    if (!(uint8arr instanceof Uint8ClampedArray)) {
      throw new Error("Invalid bitmap data: uint8arr is not a Uint8ClampedArray");
    }
    let entry: GraphicEntry | undefined = this.graphics.get(bitmapId);
    if (entry) {
      throw new Error(`Bitmap with id ${bitmapId} already exists.`);
    }
    entry = { width, height, numBytes, uint8arr } as GraphicEntry;
    this.graphics.set(bitmapId, entry);
  }

  #onBitmapDeleted(ev: Event): void {
    const { id: bitmapId } = (ev as CustomEvent).detail as { id: string };
    this.graphics.delete(bitmapId);
  }

  #onBitmapFlushed(ev: Event): void {
    const { id: bitmapId } = (ev as CustomEvent).detail as { id: string };
    this.#syncGrapicsToPreviews();
  }

  #onFileUploaded(ev: Event): void {
    const { file } = (ev as CustomEvent).detail as { file: File };
    console.log(`File uploaded:`, file);

    FileToBitmap(file).then((bitmapMsg) => {
      if (!bitmapMsg) {
        console.warn(`Uploaded file "${file.name}" is not a valid image.`);
        return;
      }
      const { id, width, height, numBytes, uint8arr } = bitmapMsg;
      const graphicEntry: GraphicEntry = { width, height, numBytes, uint8arr };
      this.graphics.set(id, graphicEntry);

      // After adding the new graphic, we trigger a flush to update the previews.
      this.#syncGrapicsToPreviews();
    }).catch((err) => {
      console.error(`Error processing uploaded file "${file.name}":`, err);
    });
  }

  #syncGrapicsToPreviews(): void {
    // Ideally this should match the graphics to previews by ids, which is not yet implemented.
    // For now we just arbitrarily take any registered graphic and apply it to all graphic.
    if (this.graphics.size === 0) {
      return;
    }
    const anyGraphic = this.graphics.values().next().value as GraphicEntry;
    for (const preview of this.previews.values()) {
      const ctx = preview.offscreen.getContext("2d") as OffscreenCanvasRenderingContext2D;
      const imageDataArr: Uint8ClampedArray<ArrayBuffer> = anyGraphic.uint8arr as Uint8ClampedArray<ArrayBuffer>;
      const imageData = new ImageData(imageDataArr, anyGraphic.width, anyGraphic.height, {colorSpace: "srgb"});
      ctx.putImageData(imageData, 20, 30);
    }
  }
};

// Draw some rectangles of different colors on the canvas.
function drawOnCanvas(canvas: OffscreenCanvas) {
  const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
  ctx.fillStyle = "red";
  ctx.fillRect(0, 0, canvas.width / 2, canvas.height / 2);
  ctx.fillStyle = "green";
  ctx.fillRect(canvas.width / 2, 0, canvas.width / 2, canvas.height / 2);
  ctx.fillStyle = "blue";
  ctx.fillRect(0, canvas.height / 2, canvas.width / 2, canvas.height / 2);
  ctx.fillStyle = "yellow";
  ctx.fillRect(canvas.width / 2, canvas.height / 2, canvas.width / 2, canvas.height / 2);
}

async function FileToImageBitmap(file: File): Promise<ImageData | null> {
  if (typeof file.type == "string" && !file.type.startsWith("image/")) {
    console.error(`File "${file.name}" is not an image. mimeType=${file.type}`);
    return null;
  }
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
    ctx.drawImage(bitmap, 0, 0);

    const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height, {
      colorSpace: "srgb",
    });
    console.log("imageData -- ", imageData.data.buffer);
    return imageData;
  } catch (err) {
    console.error(`Error processing image file "${file.name}":`, err);
    return null;
  }
}

async function FileToBitmap(file: File): Promise<BitmapCreatedMessage | null> {
  const imageData = await FileToImageBitmap(file);
  if (!imageData) {
    return null;
  }
  const bitmapId = `file:${file.name}:${file.lastModified}`;
  const uint8arr = new Uint8ClampedArray(imageData.data);
  return {
    id: bitmapId,
    width: imageData.width,
    height: imageData.height,
    numBytes: uint8arr.length,
    uint8arr: uint8arr,
  };
}

export { PipelineEventsHandler };