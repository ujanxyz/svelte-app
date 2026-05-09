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

export enum AssetType {
  MEDIA = "media",
  ARTIFACT = "artifact",
}

// Non-persisted cross-store summary for compact asset list APIs.
export interface AssetSummary {
  assetType: AssetType;
  uri: string;
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

export type ArtifactStage = "input" | "output" | "intermediate";

export interface StoredArtifactMeta {
  id: string;
  kind: "imagedata";
  stage: ArtifactStage;
  byteSize: number;
  createdAt: number;
  lastModified: number;
  updatedAt: number;
  dimension: [number, number];
}

export type StoredAssetMeta = StoredMediaMeta | StoredArtifactMeta;