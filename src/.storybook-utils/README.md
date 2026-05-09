# Storybook Image Loading Utilities

Shared utilities for loading images in Storybook stories. Used by feature mock providers to load actual images from `/public/pics` and create realistic test data.

## Usage

### In MockMediaManagerProvider

```ts
import {
  loadImageFromUrl,
  filenameFromUrl,
  inferMimeType,
} from "@/.storybook-utils/imageLoadingUtils";

const picUrls = ["/pics/liberty.png", "/pics/peacock.jpg"];

// In hydration loop:
for (const picUrl of picUrls) {
  const filename = filenameFromUrl(picUrl);
  const { blob, bitmap } = await loadImageFromUrl(picUrl);
  const mimeType = blob.type || inferMimeType(filename);
  // ... create media metadata
}
```

### In MockImageViewerProvider

```ts
<MockImageViewerProvider
  id="test-id"
  filename="peacock.jpg"
  picUrl="/pics/peacock.jpg"  <!-- Optional: load real image -->
>
  <ImageViewer />
</MockImageViewerProvider>
```

Or with synthetic placeholder:

```ts
<MockImageViewerProvider
  id="test-id"
  filename="test.png"
  width={640}
  height={480}
  <!-- No picUrl: creates synthetic gradient + grid image -->
>
  <ImageViewer />
</MockImageViewerProvider>
```

## API Reference

### `loadImageFromUrl(picUrl: string)`

Fetches an image from a URL and converts to bitmap.

**Returns:** `{ blob: Blob, bitmap: ImageBitmap, width: number, height: number }`

**Throws:** `Error` if fetch fails or image is invalid

### `filenameFromUrl(picUrl: string)`

Extracts filename from a URL, removing query params, fragments, and path.

**Returns:** `string` (e.g., `/pics/peacock.jpg` → `peacock.jpg`)

### `inferMimeType(filename: string, fallback?: string)`

Infers MIME type from filename extension.

**Returns:** `string` (e.g., `peacock.jpg` → `image/jpeg`)

**Supported extensions:** `.png`, `.jpg`, `.jpeg`, `.webp`

### `createPlaceholderBitmap(width, height, label)`

Creates a synthetic canvas-based image with gradient background, grid pattern, and centered text label.

**Returns:** `Promise<ImageBitmap>`

## Pattern

Both `MockMediaManagerProvider` and `MockImageViewerProvider` follow this pattern:

1. **Load via URL** (real images): Pass `picUrl` to load from `/public/pics`
2. **Synthetic fallback** (placeholders): Generate gradient + grid if no `picUrl`
3. **Metadata extraction**: MIME type, dimensions, file size automatically derived
4. **Lazy initialization**: Images loaded on first access (cached thereafter)

This enables both realistic storybook testing (with real images) and fallback testing (with procedural placeholders).
