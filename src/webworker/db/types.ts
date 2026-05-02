export type StoredFileKind = "binary" | "image";
export type StoredFileCategory = "input" | "output";

export interface StoredFileMeta {
  filename: string;
  mimeType: string;
  kind: StoredFileKind;
  /** Whether this file is a graph input or a pipeline output. Defaults to "input". */
  category: StoredFileCategory;
  size: number;
  lastModified: number;
  createdAt: number;
  updatedAt: number;
  /** Pixel width, populated for image files. */
  width?: number;
  /** Pixel height, populated for image files. */
  height?: number;
}

export interface StoredFileRecord extends StoredFileMeta {
  blob: Blob;
}

export class FileNameConflictError extends Error {
  public readonly filename: string;

  public constructor(filename: string) {
    super(`A file named "${filename}" already exists.`);
    this.name = "FileNameConflictError";
    this.filename = filename;
  }
}

export class FileNotFoundError extends Error {
  public readonly filename: string;

  public constructor(filename: string) {
    super(`File not found: "${filename}".`);
    this.name = "FileNotFoundError";
    this.filename = filename;
  }
}

export class NotImageFileError extends Error {
  public readonly filename: string;

  public constructor(filename: string, mimeType: string) {
    super(`File "${filename}" is not an image. mimeType=${mimeType}`);
    this.name = "NotImageFileError";
    this.filename = filename;
  }
}
