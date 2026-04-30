import { type DBSchema, type IDBPDatabase,openDB } from "idb";

import {
  FileNameConflictError,
  FileNotFoundError,
  NotImageFileError,
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

  public async putFile(file: File): Promise<StoredFileMeta> {
    const kind = inferKind(file.type);
    return await this.putBlob(file.name, file, {
      kind,
      mimeType: file.type,
      lastModified: file.lastModified,
    });
  }

  public async putBlob(
    filename: string,
    blob: Blob,
    options?: {
      kind?: StoredFileKind;
      mimeType?: string;
      lastModified?: number;
    },
  ): Promise<StoredFileMeta> {
    if (!filename) {
      throw new Error("filename must be non-empty.");
    }

    const db = await this.getDb();
    const existing = await db.get(STORE_FILES, filename);
    if (existing) {
      throw new FileNameConflictError(filename);
    }

    const now = Date.now();
    const mimeType = options?.mimeType ?? blob.type ?? "application/octet-stream";
    const record: StoredFileRecord = {
      filename,
      blob,
      mimeType,
      kind: options?.kind ?? inferKind(mimeType),
      size: blob.size,
      lastModified: options?.lastModified ?? now,
      createdAt: now,
      updatedAt: now,
    };

    await db.add(STORE_FILES, record);
    return this.toMeta(record);
  }

  public async listFiles(): Promise<StoredFileMeta[]> {
    const db = await this.getDb();
    const all = await db.getAll(STORE_FILES);
    return all
      .map((record) => this.toMeta(record))
      .sort((a, b) => b.updatedAt - a.updatedAt);
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
      size: record.size,
      lastModified: record.lastModified,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
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
