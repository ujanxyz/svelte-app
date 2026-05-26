import { type DBSchema, type IDBPDatabase,openDB } from "idb";

import {
  type ArtifactStage,
  type AssetSummary,
  AssetType,
  type StoredArtifactMeta,
  type StoredMediaMeta,
} from "@/types/worker-message-types";
import { sha256Hex } from "@/utils/hash";
import { parseAssetUri } from "@/utils/strUtils";

import {
  FileNameConflictError,
  FileNotFoundError,
} from "./types";

const DB_NAME = "WorkerFileStorage";
const DB_VERSION = 6;
const STORE_MEDIA = "media";
const STORE_ARTIFACTS = "artifacts";
const MEDIA_STORE_SCHEME = "idb" as const;
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
  [STORE_MEDIA]: {
    key: string;
    value: StoredMediaRecord;
  };

  [STORE_ARTIFACTS]: {
    key: string;
    value: StoredArtifactRecord;
  };
}

interface WorkerFileStoreOptions {
  idleCloseMs?: number;
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
    const thumbnail: ImageBitmap | null = await this.#createThumbnailFromBlob(file);
    if (!thumbnail) {
      throw new Error("Failed to create thumbnail for the uploaded media.");
    }

    const fileId = await this.#computeMediaId(file);
    const db = await this.getDb();
    const existing = await db.get(STORE_MEDIA, fileId);
    if (existing && !overwrite) {
      throw new FileNameConflictError(file.name);
    }

    const now = Date.now();
    const mimeType = file.type || "application/octet-stream";
    const kind = inferMediaKind(mimeType);
    const dim =
      kind === "image" ? await this.#getImageDimensionSafe(file) : undefined;

    const record: StoredMediaRecord = {
      id: fileId,
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

  // TODO: Make this private method.
  public async getMediaBlob(id: string): Promise<Blob> {
    const record = await this.getMediaRecordOrThrow(id);
    if (!record.blob) {
      throw new FileNotFoundError(id);
    }
    return record.blob;
  }

  public async listAssets(assetType: AssetType): Promise<Array<{ summary: AssetSummary; thumbnail: ImageBitmap }>> {
    if (assetType === AssetType.MEDIA) {
      const db = await this.getDb();
      const all = await db.getAll(STORE_MEDIA);
      return all
        .map((record) => ({
          summary: {
            assetType: AssetType.MEDIA,
            uri: this.toMediaUri(record.id),
          },
          thumbnail: record.thumbnail,
        }))
        .sort((a, b) => b.summary.uri.localeCompare(a.summary.uri));
    }

    if (assetType === AssetType.ARTIFACT) {
      const db = await this.getDb();
      const all = await db.getAll(STORE_ARTIFACTS);
      return all
        .filter((record) => record.thumbnail !== null)
        .map((record) => ({
          summary: {
            assetType: AssetType.ARTIFACT,
            uri: this.toArtifactUri(record.id),
          },
          thumbnail: record.thumbnail!,
        }))
        .sort((a, b) => b.summary.uri.localeCompare(a.summary.uri));
    }

    throw new Error(`Unsupported asset type: ${assetType}`);
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
    id: string,
    image: ImageData,
    options: { stage: ArtifactStage; lastModified?: number; thumbnail?: ImageData | null },
  ): Promise<{ id: string; meta: StoredArtifactMeta }> {
    const db = await this.getDb();
    const now = Date.now();
    const existing = await db.get(STORE_ARTIFACTS, id);

    const record: StoredArtifactRecord = {
      id,
      kind: "imagedata",
      stage: options.stage,
      byteSize: image.data.byteLength,
      createdAt: existing?.createdAt ?? now,
      lastModified: options?.lastModified ?? now,
      updatedAt: now,
      dimension: [image.width, image.height],
      image,
      thumbnail: await this.#createThumbnailFromImageData(options?.thumbnail ?? image),
    };

    await db.put(STORE_ARTIFACTS, record);
    return { id, meta: this.toArtifactMeta(record) };
  }

  public async listArtifacts(): Promise<Array<{ id: string; meta: StoredArtifactMeta }>> {
    const db = await this.getDb();
    const keys = await db.getAllKeys(STORE_ARTIFACTS);
    const records = await db.getAll(STORE_ARTIFACTS);

    return records
      .map((record, index) => ({
        id: keys[index] as string,
        meta: this.toArtifactMeta(record),
      }))
      .sort((a, b) => b.meta.createdAt - a.meta.createdAt);
  }

  public async getArtifact(id: string): Promise<StoredArtifactRecord> {
    const db = await this.getDb();
    const record = await db.get(STORE_ARTIFACTS, id);
    if (!record) {
      throw new Error(`Artifact not found for id: ${id}`);
    }
    console.log(`Fetched artifact record for id ${id}:`, record);
    return record;
  }

  public async deleteArtifact(id: string): Promise<boolean> {
    const db = await this.getDb();
    const key = await db.getKey(STORE_ARTIFACTS, id);
    if (key === undefined) {
      return false;
    }
    await db.delete(STORE_ARTIFACTS, id);
    return true;
  }

  public async getAssetBitmap(assetUri: string): Promise<{ meta: StoredMediaMeta | StoredArtifactMeta; bitmap: ImageBitmap }> {
    const parsed = parseAssetUri(assetUri)!;
    if (parsed.scheme !== MEDIA_STORE_SCHEME) {
      throw new Error(`Unsupported asset URI scheme: ${parsed.scheme}`);
    }

    if (parsed.store === STORE_MEDIA) {
      const blob = await this.getMediaBlob(parsed.id);
      const bitmap = await createImageBitmap(blob);
      const meta = await this.getMediaMeta(parsed.id);
      return { meta, bitmap };
    }

    if (parsed.store === STORE_ARTIFACTS) {
      const artifact = await this.getArtifact(parsed.id);
      if (!artifact.image) {
        throw new Error(`Artifact image not found for id: ${parsed.id}`);
      }
      const bitmap = await createImageBitmap(artifact.image);
      const meta = this.toArtifactMeta(artifact);
      return { meta, bitmap };
    }

    throw new Error(`Unsupported asset URI store: ${parsed.store}`);
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

  public close(): void {
    this.#clearIdleTimer();
    if (this.dbPromise) {
      void this.dbPromise.then((db) => db.close());
      this.dbPromise = null;
    }
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
    this.#bumpIdleTimer();

    if (!this.dbPromise) {
      this.dbPromise = openDB<WorkerFileDbSchema>(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion) {
          const rawDb = db as any;

          if (rawDb.objectStoreNames.contains("files")) {
            rawDb.deleteObjectStore("files");
          }

          if (oldVersion < 3 && db.objectStoreNames.contains(STORE_MEDIA)) {
            db.deleteObjectStore(STORE_MEDIA);
          }

          if (!db.objectStoreNames.contains(STORE_MEDIA)) {
            db.createObjectStore(STORE_MEDIA, { keyPath: "id" });
          }

          if (oldVersion < 6 && db.objectStoreNames.contains(STORE_ARTIFACTS)) {
            db.deleteObjectStore(STORE_ARTIFACTS);
          }

          if (!db.objectStoreNames.contains(STORE_ARTIFACTS)) {
            db.createObjectStore(STORE_ARTIFACTS, { keyPath: "id" });
          }

          if (rawDb.objectStoreNames.contains("outputs")) {
            rawDb.deleteObjectStore("outputs");
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

  private toMediaUri(id: string): string {
    return `${MEDIA_STORE_SCHEME}:/${STORE_MEDIA}/${id}`;
  }

  private toArtifactMeta(record: StoredArtifactRecord): StoredArtifactMeta {
    return {
      id: record.id,
      kind: record.kind,
      stage: record.stage,
      byteSize: record.byteSize,
      createdAt: record.createdAt,
      lastModified: record.lastModified,
      updatedAt: record.updatedAt,
      dimension: record.dimension,
    };
  }

  private toArtifactUri(id: string): string {
    return `${MEDIA_STORE_SCHEME}:/${STORE_ARTIFACTS}/${id}`;
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

  async #getImageDimensionSafe(blob: Blob): Promise<[number, number] | undefined> {
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
    const targetWidth = Math.max(1, Math.round(source.width * scale)|0);
    const targetHeight = Math.max(1, Math.round(source.height * scale)|0);

    const canvas = new OffscreenCanvas(targetWidth, targetHeight);
    const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
    ctx.drawImage(source, 0, 0, targetWidth, targetHeight);

    return canvas.transferToImageBitmap();
  }

  #bumpIdleTimer(): void {
    this.#clearIdleTimer();
    this.idleTimer = setTimeout(() => {
      this.close();
    }, this.idleCloseMs);
  }

  #clearIdleTimer(): void {
    if (this.idleTimer !== null) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }
}

export { WorkerIndexedDb };
