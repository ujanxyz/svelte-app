<script lang="ts">
import { setContext, type Snippet } from "svelte";

import { createPlaceholderBitmap, inferMimeType, loadImageFromUrl } from "@/.storybook-utils/imageLoadingUtils";
import { defaultOverlayOptions,OVERLAY_INSTANCE_CONTEXT } from "@/modules/overlay2/constants";
import type { OverlayInstance } from "@/modules/overlay2/types";
import type { StoredMediaMeta } from "@/types/worker-message-types";
import { IoWorkerApi } from "@/webworkerclient/IoWorkerApi";

interface Props {
  id: string;
  width?: number;
  height?: number;
  filename: string;
  mimeType?: string;
  byteSize?: number;
  picUrl?: string;
  children: Snippet;
}

const {
  id,
  width = 1280,
  height = 720,
  filename,
  mimeType,
  byteSize = 0,
  picUrl,
  children,
}: Props = $props();

let cachedBitmap: ImageBitmap | null = null;
let loadedImageData: { width: number; height: number; mimeType: string; byteSize: number } | null = null;
let loadError: Error | null = null;

async function makeBitmap(): Promise<ImageBitmap> {
  if (cachedBitmap) return cachedBitmap;
  
  if (picUrl) {
    try {
      const data = await loadImageFromUrl(picUrl);
      loadedImageData = {
        width: data.width,
        height: data.height,
        mimeType: data.blob.type || inferMimeType(filename),
        byteSize: data.blob.size,
      };
      cachedBitmap = data.bitmap;
    } catch (err) {
      loadError = err as Error;
      throw err;
    }
  } else {
    cachedBitmap = await createPlaceholderBitmap(width, height, filename);
  }
  
  return cachedBitmap;
}

const mockIo = {
  async getMediaData(request: { id: string }): Promise<{ meta: StoredMediaMeta; bitmap: ImageBitmap }> {
    const bitmap = await makeBitmap();
    const finalDims = loadedImageData ? [loadedImageData.width, loadedImageData.height] : [width, height];
    const finalMimeType = loadedImageData?.mimeType || mimeType || "image/jpeg";
    const finalByteSize = loadedImageData?.byteSize || byteSize || 0;
    return {
      meta: {
        id: request.id,
        filename,
        mimeType: finalMimeType,
        kind: "image",
        byteSize: finalByteSize,
        createdAt: Date.now(),
        lastModified: Date.now(),
        updatedAt: Date.now(),
        dimension: finalDims as [number, number],
      },
      bitmap,
    };
  },
} as unknown as IoWorkerApi;

const mockOverlayInstance: OverlayInstance<{ id: string }, void> = $derived.by(() => ({
  id: "mock-image-viewer-overlay-id",
  payload: { id },
  options: { ...defaultOverlayOptions },
  manager: undefined as any,
  setTranslate: () => {},
  settle: () => {},
  abort: () => {},
}));

setContext(IoWorkerApi.CONTEXT_KEY), mockIo);
// svelte-ignore state_referenced_locally
setContext(OVERLAY_INSTANCE_CONTEXT, mockOverlayInstance);
</script>

{@render children()}
