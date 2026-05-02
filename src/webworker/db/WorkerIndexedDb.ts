import { type DBSchema, type IDBPDatabase, openDB } from "idb";

import type { StoredArtifactMeta, StoredMediaMeta } from "@/types/worker-message-types";
import { sha256Hex } from "@/utils/hash";

import {
  FileNameConflictError,
  FileNotFoundError,
  NotImageFileError,
  type StoredFileCategory,
  type StoredFileKind,
  type StoredFileMeta,
  type StoredFileRecord,
} from "./types";

const DB_NAME = "WorkerFileStorage";
const DB_VERSION = 3;
const STORE_FILES = "files";
const STORE_MEDIA = "media";
const STORE_ARTIFACTS = "artifacts";
const DEFAULT_IDLE_CLOSE_MS = 60_000;

export interface StoredMediaRecord extends StoredMediaMeta {
  blob: Blob | null;
  thumbnail: ImageBitmap;
}

export interface StoredArtifactRecord extends StoredArtifactMeta {
  image: ImageData | null;
  thumbnail: ImageBitmap | null;
}

interface WorkerFileDbSchema extends DBSchema {
  [STORE_FILES]: {
    key: string;
    value: StoredFileRecord;
  };

  [STORE_MEDIA]: {
    key: string;
    value: StoredMediaRecord;
  };

  [STORE_ARTIFACTS]: {
    key: number;
    value: StoredArtifactRecord;
  };
}

interface WorkerFileStoreOptions {
  idleCloseMs?: number;
}

function inferKind(mimeType: string): StoredFileKind {
  return mimeType.startsWith("image/") ? "image" : "binary";
}

function inferMediaKind(mimeType: string): "image" | "video" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  throw new Error(`Unsupported media mimeType: ${mimeType}`);
}

/**
 * This class manages the interaction with the IndexedDB storage for files in the web worker.
 * This serves as a store for images / media files and assets consumed in the execution pipeline.
 */
class WorkerIndexedDb {
  private readonly idleCloseMs: number;
  private dbPromise: Promise<IDBPDatabase<WorkerFileDbSchema>> | null = null;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;

  public constructor(options?: WorkerFileStoreOptions) {
    this.idleCloseMs = options?.idleCloseMs ?? DEFAULT_IDLE_CLOSE_MS;
  }

  //-- (srat) Add new sets of APIs here --
  /**
   * Store an input media file. Pass overwrite=true to replace an existing entry
   * with the same filename instead of throwing.
   *
   * The file is converted into a Blob and stored along with its metadata. The original
   * filename is used as the key.
   */
  public async uploadMedia(
    file: File,
    overwrite: boolean = false,
  ): Promise<{ meta: StoredMediaMeta, thumbnail: ImageBitmap }> {
    if (!file?.name) {
      throw new Error("file.name must be non-empty.");
    }

    const thumbnail: ImageBitmap | null = await this.#createThumbnailFromBlob(file);
    if (!thumbnail) {
      throw new Error("Failed to create thumbnail for the uploaded media.");
    }

    const id = await this.#computeMediaId(file);
    const db = await this.getDb();
    const existing = await db.get(STORE_MEDIA, id);
    if (existing && !overwrite) {
      throw new FileNameConflictError(file.name);
    }

    const now = Date.now();
    const mimeType = file.type || "application/octet-stream";
    const kind = inferMediaKind(mimeType);
    const dim =
      kind === "image" ? await this.getImageDimensionSafe(file) : undefined;

    const record: StoredMediaRecord = {
      id,
      filename: file.name,
      mimeType,
      kind,
      byteSize: file.size,
      createdAt: existing?.createdAt ?? now,
      lastModified: file.lastModified || now,
      updatedAt: now,
      dimension: dim,
      // Fields beyond the metadata:
      blob: file,
      thumbnail,
    };

    if (overwrite) {
      await db.put(STORE_MEDIA, record);
    } else {
      await db.add(STORE_MEDIA, record);
    }

    return { meta: this.toMediaMeta(record), thumbnail };
  }

  /**
   * Returns a list of all media files stored in the database, sorted by updatedAt descending.
   * Each entry includes both the metadata and the thumbnail bitmap.
   */
  public async listMedia(): Promise<{ meta: StoredMediaMeta; thumbnail: ImageBitmap }[]> {
    const db = await this.getDb();
    const all = await db.getAll(STORE_MEDIA);
    return all
      .map((record) => ({ meta: this.toMediaMeta(record), thumbnail: record.thumbnail }))
      .sort((a, b) => b.meta.updatedAt - a.meta.updatedAt);
  }

  /**
   * Deletes a media file by its filename. Returns true if the file existed and was deleted,
   * false if it did not exist.
   */
  public async deleteMedia(ids: string[]): Promise<{ deletedIds: string[] }> {
    const db = await this.getDb();
    const deletedIds: string[] = [];

    for (const id of ids) {
      const existed = await db.getKey(STORE_MEDIA, id);
      if (existed === undefined) {
        continue;
      }
      await db.delete(STORE_MEDIA, id);
      deletedIds.push(id);
    }

    return { deletedIds };
  }

  public async getMediaMeta(id: string): Promise<StoredMediaMeta> {
    const record = await this.getMediaRecordOrThrow(id);
    return this.toMediaMeta(record);
  }

  public async getMediaBlob(id: string): Promise<Blob> {
    const record = await this.getMediaRecordOrThrow(id);
    if (!record.blob) {
      throw new FileNotFoundError(id);
    }
    return record.blob;
  }

  public async clearMedia(): Promise<number> {
    const db = await this.getDb();
    const keys = await db.getAllKeys(STORE_MEDIA);
    const tx = db.transaction(STORE_MEDIA, "readwrite");
    await Promise.all(keys.map((k) => tx.store.delete(k)));
    await tx.done;
    return keys.length;
  }

  public async uploadArtifactImage(
    image: ImageData,
    options?: { lastModified?: number; thumbnail?: ImageData | null },
  ): Promise<{ id: number; meta: StoredArtifactMeta }> {
    const db = await this.getDb();
    const now = Date.now();

    const record: StoredArtifactRecord = {
      kind: "imagedata",
      byteSize: image.data.byteLength,
      createdAt: now,
      lastModified: options?.lastModified ?? now,
      dimension: [image.width, image.height],
      image,
      thumbnail: await this.#createThumbnailFromImageData(options?.thumbnail ?? image),
    };

    const id = await db.add(STORE_ARTIFACTS, record);
    return { id, meta: this.toArtifactMeta(record) };
  }

  public async listArtifacts(): Promise<Array<{ id: number; meta: StoredArtifactMeta }>> {
    const db = await this.getDb();
    const keys = await db.getAllKeys(STORE_ARTIFACTS);
    const records = await db.getAll(STORE_ARTIFACTS);

    return records
      .map((record, index) => ({
        id: keys[index] as number,
        meta: this.toArtifactMeta(record),
      }))
      .sort((a, b) => b.meta.createdAt - a.meta.createdAt);
  }

  public async getArtifact(id: number): Promise<StoredArtifactRecord> {
    const db = await this.getDb();
    const record = await db.get(STORE_ARTIFACTS, id);
    if (!record) {
      throw new Error(`Artifact not found for id: ${id}`);
    }
    return record;
  }

  public async deleteArtifact(id: number): Promise<boolean> {
    const db = await this.getDb();
    const key = await db.getKey(STORE_ARTIFACTS, id);
    if (key === undefined) {
      return false;
    }
    await db.delete(STORE_ARTIFACTS, id);
    return true;
  }

  public async clearArtifacts(): Promise<number> {
    const db = await this.getDb();
    const keys = await db.getAllKeys(STORE_ARTIFACTS);
    const tx = db.transaction(STORE_ARTIFACTS, "readwrite");
    await Promise.all(keys.map((k) => tx.store.delete(k)));
    await tx.done;
    return keys.length;
  }

  //-- (end) Add new sets of APIs here --

  public async hasFile(filename: string): Promise<boolean> {
    const db = await this.getDb();
    const key = await db.getKey(STORE_FILES, filename);
    return key !== undefined;
  }

  public async getImageBitmap(
    filename: string,
    options?: ImageBitmapOptions,
  ): Promise<ImageBitmap> {
    const record = await this.getRecordOrThrow(filename);
    if (record.kind !== "image" && !record.mimeType.startsWith("image/")) {
      throw new NotImageFileError(filename, record.mimeType);
    }
    return await createImageBitmap(record.blob, options);
  }

  /** Get the pixel data for an image file. */
  public async getImageData(filename: string): Promise<ImageData> {
    const bitmap = await this.getImageBitmap(filename);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    return ctx.getImageData(0, 0, canvas.width, canvas.height, { colorSpace: "srgb" });
  }

  public close(): void {
    this.clearIdleTimer();
    if (this.dbPromise) {
      void this.dbPromise.then((db) => db.close());
      this.dbPromise = null;
    }
  }

  private async getRecordOrThrow(filename: string): Promise<StoredFileRecord> {
    const db = await this.getDb();
    const record = await db.get(STORE_FILES, filename);
    if (!record) {
      throw new FileNotFoundError(filename);
    }
    return record;
  }

  private async getMediaRecordOrThrow(id: string): Promise<StoredMediaRecord> {
    const db = await this.getDb();
    const record = await db.get(STORE_MEDIA, id);
    if (!record) {
      throw new FileNotFoundError(id);
    }
    return record;
  }

  private async getDb(): Promise<IDBPDatabase<WorkerFileDbSchema>> {
    this.bumpIdleTimer();

    if (!this.dbPromise) {
      this.dbPromise = openDB<WorkerFileDbSchema>(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion) {
          if (!db.objectStoreNames.contains(STORE_FILES)) {
            db.createObjectStore(STORE_FILES, { keyPath: "filename" });
          }

          if (oldVersion < 3 && db.objectStoreNames.contains(STORE_MEDIA)) {
            db.deleteObjectStore(STORE_MEDIA);
          }

          if (!db.objectStoreNames.contains(STORE_MEDIA)) {
            db.createObjectStore(STORE_MEDIA, { keyPath: "id" });
          }

          if (!db.objectStoreNames.contains(STORE_ARTIFACTS)) {
            db.createObjectStore(STORE_ARTIFACTS, { autoIncrement: true });
          }
        },
      });
    }
    return await this.dbPromise;
  }

  private toMediaMeta(record: StoredMediaRecord): StoredMediaMeta {
    return {
      id: record.id,
      filename: record.filename,
      mimeType: record.mimeType,
      kind: record.kind,
      byteSize: record.byteSize,
      createdAt: record.createdAt,
      lastModified: record.lastModified,
      updatedAt: record.updatedAt,
      dimension: record.dimension,
    };
  }

  private toArtifactMeta(record: StoredArtifactRecord): StoredArtifactMeta {
    return {
      kind: record.kind,
      byteSize: record.byteSize,
      createdAt: record.createdAt,
      lastModified: record.lastModified,
      dimension: record.dimension,
    };
  }

  async #computeMediaId(file: File): Promise<string> {
    const fileHash = await sha256Hex(file);
    const seed = `${file.name}:${fileHash}`;
    const idHash = await sha256Hex(new TextEncoder().encode(seed).buffer);
    const shortHash = idHash.slice(0, 16);
    const dotIdx = file.name.lastIndexOf(".");
    if (dotIdx > 0) {
      const base = file.name.slice(0, dotIdx);
      const ext = file.name.slice(dotIdx + 1);
      return `${base}.${shortHash}.${ext}`;
    }
    return `${file.name}.${shortHash}`;
  }

  private async getImageDimensionSafe(blob: Blob): Promise<[number, number] | undefined> {
    try {
      const bmp = await createImageBitmap(blob);
      const dim: [number, number] = [bmp.width, bmp.height];
      bmp.close();
      return dim;
    } catch {
      return undefined;
    }
  }

  async #createThumbnailFromBlob(blob: Blob): Promise<ImageBitmap | null> {
    try {
      const source = await createImageBitmap(blob);
      const thumbnail = this.#createThumbnailFromBitmap(source);
      source.close();
      return thumbnail;
    } catch {
      return null;
    }
  }

  async #createThumbnailFromImageData(image: ImageData): Promise<ImageBitmap | null> {
    try {
      const source = await createImageBitmap(image);
      const thumbnail = this.#createThumbnailFromBitmap(source);
      source.close();
      return thumbnail;
    } catch {
      return null;
    }
  }

  #createThumbnailFromBitmap(source: ImageBitmap): ImageBitmap {
    const maxEdge = 160;
    const scale = Math.min(1, maxEdge / Math.max(source.width, source.height));
    const targetWidth = Math.max(1, Math.round(source.width * scale));
    const targetHeight = Math.max(1, Math.round(source.height * scale));

    const canvas = new OffscreenCanvas(targetWidth, targetHeight);
    const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
    ctx.drawImage(source, 0, 0, targetWidth, targetHeight);

    return canvas.transferToImageBitmap();
  }

  private toMeta(record: StoredFileRecord): StoredFileMeta {
    return {
      filename: record.filename,
      mimeType: record.mimeType,
      kind: record.kind,
      category: record.category ?? "input",
      size: record.size,
      lastModified: record.lastModified,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      width: record.width,
      height: record.height,
    };
  }

  private bumpIdleTimer(): void {
    this.clearIdleTimer();
    this.idleTimer = setTimeout(() => {
      this.close();
    }, this.idleCloseMs);
  }

  private clearIdleTimer(): void {
    if (this.idleTimer !== null) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }
}

export { WorkerIndexedDb };
