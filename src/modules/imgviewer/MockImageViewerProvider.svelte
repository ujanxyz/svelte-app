<script lang="ts">
import { setContext, type Snippet } from "svelte";

import { defaultOverlayOptions,OVERLAY_INSTANCE_CONTEXT } from "@/modules/overlay2/constants";
import type { OverlayInstance } from "@/modules/overlay2/types";
import type { StoredMediaMeta } from "@/types/worker-message-types";
import type { GraphIoManager } from "@/webworkerclient/GraphIoManager";

interface Props {
  id: string;
  width: number;
  height: number;
  filename: string;
  mimeType: string;
  byteSize: number;
  children: Snippet;
}

const {
  id,
  width,
  height,
  filename,
  mimeType,
  byteSize,
  children,
}: Props = $props();

let cachedBitmap: ImageBitmap | null = null;

async function makeBitmap(): Promise<ImageBitmap> {
  if (cachedBitmap) return cachedBitmap;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, "#153777");
  grad.addColorStop(1, "#a64e2f");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  const step = Math.max(28, Math.floor(Math.min(width, height) / 9));
  for (let x = 0; x < width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.font = `bold ${Math.max(16, Math.floor(Math.min(width, height) * 0.06))}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(filename, width / 2, height / 2);

  cachedBitmap = await createImageBitmap(canvas);
  return cachedBitmap;
}

const mockIo = {
  async getMediaData(request: { id: string }): Promise<{ meta: StoredMediaMeta; bitmap: ImageBitmap }> {
    const bitmap = await makeBitmap();
    return {
      meta: {
        id: request.id,
        filename,
        mimeType,
        kind: "image",
        byteSize,
        createdAt: Date.now(),
        lastModified: Date.now(),
        updatedAt: Date.now(),
        dimension: [width, height],
      },
      bitmap,
    };
  },
} as unknown as GraphIoManager;

const mockOverlayInstance: OverlayInstance<{ id: string }, void> = {
  id: "mock-image-viewer-overlay-id",
  payload: { id },
  options: { ...defaultOverlayOptions },
  manager: undefined as any,
  settle: () => {},
  abort: () => {},
};

setContext(Symbol.for("GraphIoManager"), mockIo);
setContext(OVERLAY_INSTANCE_CONTEXT, mockOverlayInstance);
</script>

{@render children()}
