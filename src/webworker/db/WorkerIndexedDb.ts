import { type DBSchema, type IDBPDatabase,openDB } from "idb";

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
const DB_VERSION = 1;
const STORE_FILES = "files";
const DEFAULT_IDLE_CLOSE_MS = 60_000;

interface WorkerFileDbSchema extends DBSchema {
  [STORE_FILES]: {
    key: string;
    value: StoredFileRecord;
  };
}

interface WorkerFileStoreOptions {
  idleCloseMs?: number;
}

function inferKind(mimeType: string): StoredFileKind {
  return mimeType.startsWith("image/") ? "image" : "binary";
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

  /**
   * Store an input media file. Pass overwrite=true to replace an existing entry
   * with the same filename instead of throwing.
   */
  public async uploadMedia(file: File, options?: { overwrite?: boolean }): Promise<StoredFileMeta> {
    return await this.putFile(file, { category: "input", overwrite: options?.overwrite });
  }

  public async putFile(
    file: File,
    options?: { category?: StoredFileCategory; overwrite?: boolean },
  ): Promise<StoredFileMeta> {
    const kind = inferKind(file.type);
    return await this.putBlob(file.name, file, {
      kind,
      mimeType: file.type,
      lastModified: file.lastModified,
      category: options?.category ?? "input",
      overwrite: options?.overwrite,
    });
  }

  public async putBlob(
    filename: string,
    blob: Blob,
    options?: {
      kind?: StoredFileKind;
      mimeType?: string;
      lastModified?: number;
      category?: StoredFileCategory;
      overwrite?: boolean;
      width?: number;
      height?: number;
    },
  ): Promise<StoredFileMeta> {
    if (!filename) {
      throw new Error("filename must be non-empty.");
    }

    const db = await this.getDb();
    const existing = await db.get(STORE_FILES, filename);
    if (existing && !options?.overwrite) {
      throw new FileNameConflictError(filename);
    }

    const now = Date.now();
    const mimeType = options?.mimeType ?? blob.type ?? "application/octet-stream";
    const record: StoredFileRecord = {
      filename,
      blob,
      mimeType,
      kind: options?.kind ?? inferKind(mimeType),
      category: options?.category ?? "input",
      size: blob.size,
      lastModified: options?.lastModified ?? now,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      width: options?.width,
      height: options?.height,
    };

    // Use put (upsert) when overwriting, add (strict insert) otherwise.
    if (options?.overwrite) {
      await db.put(STORE_FILES, record);
    } else {
      await db.add(STORE_FILES, record);
    }
    return this.toMeta(record);
  }

  public async listFiles(): Promise<StoredFileMeta[]> {
    const db = await this.getDb();
    const all = await db.getAll(STORE_FILES);
    return all
      .map((record) => this.toMeta(record))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  /** List all input media files (category "input", or legacy records without a category). */
  public async listInputMedia(): Promise<StoredFileMeta[]> {
    const all = await this.listFiles();
    return all.filter((f) => f.category === "input");
  }

  /** List all output media files produced by the pipeline. */
  public async listOutputMedia(): Promise<StoredFileMeta[]> {
    const all = await this.listFiles();
    return all.filter((f) => f.category === "output");
  }

  public async hasFile(filename: string): Promise<boolean> {
    const db = await this.getDb();
    const key = await db.getKey(STORE_FILES, filename);
    return key !== undefined;
  }

  public async getBlob(filename: string): Promise<Blob> {
    const record = await this.getRecordOrThrow(filename);
    return record.blob;
  }

  public async getMeta(filename: string): Promise<StoredFileMeta> {
    const record = await this.getRecordOrThrow(filename);
    return this.toMeta(record);
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

  public async deleteFile(filename: string): Promise<boolean> {
    const db = await this.getDb();
    const existed = await this.hasFile(filename);
    if (!existed) {
      return false;
    }

    await db.delete(STORE_FILES, filename);
    return true;
  }

  /** Delete all output media files produced by the pipeline. */
  public async clearOutputMedia(): Promise<number> {
    const db = await this.getDb();
    const all = await db.getAll(STORE_FILES);
    const outputs = all.filter((r) => r.category === "output");
    await Promise.all(outputs.map((r) => db.delete(STORE_FILES, r.filename)));
    return outputs.length;
  }

  /** Delete all input and output media files. */
  public async clearAllMedia(): Promise<number> {
    const db = await this.getDb();
    const all = await db.getAll(STORE_FILES);
    const tx = db.transaction(STORE_FILES, "readwrite");
    await Promise.all(all.map((r) => tx.store.delete(r.filename)));
    await tx.done;
    return all.length;
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

  private async getDb(): Promise<IDBPDatabase<WorkerFileDbSchema>> {
    this.bumpIdleTimer();

    if (!this.dbPromise) {
      this.dbPromise = openDB<WorkerFileDbSchema>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_FILES)) {
            db.createObjectStore(STORE_FILES, { keyPath: "filename" });
          }
        },
      });
    }
    return await this.dbPromise;
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
