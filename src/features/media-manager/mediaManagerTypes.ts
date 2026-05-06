export type MediaKind = "JPG" | "PNG" | "WEBP" | "MP4";

export interface MediaItem {
  id: string;
  displayName: string;
  filename: string;
  width: number;
  height: number;
  sizeLabel: string;
  kind: MediaKind;
  addedAt: number;
  addedAgoLabel: string;
  thumbnailBitmap: ImageBitmap;
}

export type MediaViewMode = "list" | "grid";
