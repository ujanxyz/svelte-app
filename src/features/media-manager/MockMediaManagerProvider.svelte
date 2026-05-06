<script lang="ts">
import { setContext, type Snippet } from "svelte";

import { defaultOverlayOptions, OVERLAY_INSTANCE_CONTEXT } from "@/modules/overlay2/constants";
import type { OverlayInstance } from "@/modules/overlay2/types";
import type { StoredMediaMeta } from "@/types/worker-message-types";
import type { GraphIoManager } from "@/webworkerclient/GraphIoManager";

interface MockMediaEntry {
  meta: StoredMediaMeta;
  picUrl: string;
  thumbnail: ImageBitmap;
}

interface Props {
  picUrls: string[];
  children: Snippet;
}

const { picUrls, children }: Props = $props();

let mediaEntries = $state.raw<MockMediaEntry[]>([]);
let initPromise: Promise<void> | null = null;

$effect(() => {
  initPromise = hydrateFromUrls(picUrls);
});

function inferMimeType(filename: string, fallback = "image/jpeg"): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  return fallback;
}

function filenameFromUrl(picUrl: string): string {
  const clean = picUrl.split("?")[0]?.split("#")[0] ?? picUrl;
  return clean.split("/").pop() || "mock-image.jpg";
}

async function loadImageFromUrl(picUrl: string): Promise<{ blob: Blob; bitmap: ImageBitmap }> {
  const response = await fetch(picUrl);
  if (!response.ok) {
    throw new Error(`Failed to load mock image: ${picUrl}`);
  }
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);
  return { blob, bitmap };
}

async function hydrateFromUrls(urls: string[]): Promise<void> {
  const now = Date.now();
  const entries = await Promise.all(
    urls.map(async (picUrl, index) => {
      const filename = filenameFromUrl(picUrl);
      const { blob, bitmap } = await loadImageFromUrl(picUrl);
      const mimeType = blob.type || inferMimeType(filename);
      const updatedAt = now - (index + 1) * 180_000;
      const meta: StoredMediaMeta = {
        id: `mock-${index + 1}-${filename.replace(/[^a-zA-Z0-9]/g, "-")}`,
        filename,
        mimeType,
        kind: mimeType.startsWith("video/") ? "video" : "image",
        byteSize: blob.size,
        createdAt: updatedAt,
        lastModified: updatedAt,
        updatedAt,
        dimension: [bitmap.width, bitmap.height],
      };
      return { meta, picUrl, thumbnail: bitmap };
    }),
  );
  mediaEntries = entries;
}

async function ensureInitialized(): Promise<void> {
  if (!initPromise) {
    initPromise = hydrateFromUrls(picUrls);
  }
  await initPromise;
}

const mockMediaManager: GraphIoManager = {
  listMedia: async () => {
    await ensureInitialized();
    return {
      mediaEntries: mediaEntries.map((item) => ({
        meta: item.meta,
        thumbnail: item.thumbnail,
      })),
    };
  },
  uploadMedia: async ({ file }: { file: File }) => {
    await ensureInitialized();
    const now = Date.now();
    const bitmap = await createImageBitmap(file);
    const id = `uploaded-${now}-${file.name.replace(/[^a-zA-Z0-9]/g, "-")}`;
    const meta: StoredMediaMeta = {
      id,
      filename: file.name,
      mimeType: file.type || inferMimeType(file.name),
      kind: (file.type || "").startsWith("video/") ? "video" : "image",
      byteSize: file.size,
      createdAt: now,
      lastModified: file.lastModified || now,
      updatedAt: now,
      dimension: [bitmap.width, bitmap.height],
    };
    mediaEntries = [{ meta, picUrl: URL.createObjectURL(file), thumbnail: bitmap }, ...mediaEntries];
    return { meta, thumbnail: bitmap };
  },
  deleteMedia: async ({ ids }: { ids: string[] }) => {
    await ensureInitialized();
    const idSet = new Set(ids);
    mediaEntries = mediaEntries.filter((entry) => !idSet.has(entry.meta.id));
    return { deletedIds: ids };
  },
  getMediaData: async (request: any) => {
    await ensureInitialized();
    const item = mediaEntries.find((i) => i.meta.id === request.id);
    if (!item) throw new Error(`Media not found: ${request.id}`);
    return { meta: item.meta, bitmap: item.thumbnail };
  },
} as unknown as GraphIoManager;

const mockOverlay: OverlayInstance<any, any> = {
  id: "mock-overlay-id",
  payload: undefined,
  options: { ...defaultOverlayOptions },
  manager: undefined as any,
  setTranslate: () => {},
  settle: () => {},
  abort: () => {},
};

setContext(Symbol.for("GraphIoManager"), mockMediaManager);
setContext(OVERLAY_INSTANCE_CONTEXT, mockOverlay);
</script>

{@render children()}
