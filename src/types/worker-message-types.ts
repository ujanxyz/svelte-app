export interface SecureMessage {
  seq: bigint;
  code: string;
  payload: any;
}

export interface RawWorkerResponse {
  ack: bigint;
  ok: boolean;
  code: string; // Always "OK" on success.
  reqcode?: string;
  payload?: Record<string, any>; // If ok
  error?: string; // If !ok
}

export interface MediaInfoMessage {
  filename: string;
}

//-----------------------------------------------------
// Used

interface WorkerResponseInClient {
  ok: boolean
  code: string;
  payload?: Record<string, any>;
  error?: string;
}

export interface StoredMediaMeta {
  id: string;
  filename: string;
  mimeType: string;
  kind: "image" | "video";
  byteSize: number;
  createdAt: number;
  lastModified: number;
  updatedAt: number;
  dimension?: [number, number];
}

export interface StoredArtifactMeta {
  kind: "imagedata";
  byteSize: number;
  createdAt: number;
  lastModified: number;
  dimension: [number, number];
}