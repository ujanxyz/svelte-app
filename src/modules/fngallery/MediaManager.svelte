<script lang="ts" module>
export interface MediaManagerPayload {
  preselectedIds?: string[];
}
</script>

<script lang="ts">
import { getContext, onMount } from "svelte";

import FileDropZone from "@/components/FileDropZone.svelte";
import { useOverlayInstance } from "@/modules/overlay2";
import type { StoredMediaMeta } from "@/types/worker-message-types";
import type { GraphIoManager } from "@/webworkerclient/GraphIoManager";

import MediaManagerGridItem from "./MediaManagerGridItem.svelte";
import MediaManagerListItem from "./MediaManagerListItem.svelte";
import type { MediaItem, MediaViewMode } from "./mediaManagerTypes";

const io = getContext(Symbol.for("GraphIoManager")) as GraphIoManager;
const overlay = useOverlayInstance<MediaManagerPayload, never>();

let items = $state.raw<MediaItem[]>([]);
let loading = $state(true);
let sortBy = $state<"date-desc" | "date-asc" | "name-asc">("date-desc");
let viewMode = $state<MediaViewMode>("list");
let selectedIds = $state(new Set<string>());
let unusedItemsCount = $state(0);
let loadingUsageInsight = $state(true);
const orderedItems = $derived(sortItems(items, sortBy));
const selectedCount = $derived(selectedIds.size);

onMount(async () => {
  await refreshMediaItems();
  const preselectedIds = overlay.payload?.preselectedIds;
  if (Array.isArray(preselectedIds) && preselectedIds.length > 0) {
    selectedIds = new Set(preselectedIds);
  }
  await refreshUsageInsight(items);
  loading = false;
});

async function handleUpload(file: File): Promise<string> {
  const { meta, thumbnail } = await io.uploadMedia({ file, overwrite: false });
  const newItem = toMediaItem(meta, thumbnail);
  items = [newItem, ...items];
  await refreshUsageInsight(items);
  return meta.id;
}

function handleClose(): void {
  overlay.abort();
}

function handleCheckbox(id: string, checked: boolean): void {
  const next = new Set(selectedIds);
  if (checked) next.add(id);
  else next.delete(id);
  selectedIds = next;
}

async function handleDeleteOne(id: string): Promise<void> {
  await io.deleteMedia({ ids: [id] });

  const next = new Set(selectedIds);
  next.delete(id);
  selectedIds = next;

  await refreshMediaItems();
  await refreshUsageInsight(items);
}

async function handleDeleteSelected(): Promise<void> {
  if (selectedIds.size === 0) return;
  await io.deleteMedia({ ids: [...selectedIds] });
  selectedIds = new Set();

  await refreshMediaItems();
  await refreshUsageInsight(items);
}

function handleTodoMenu(id: string): void {
  console.log("TODO: add item menu actions for", id);
}

async function handleRefresh(): Promise<void> {
  await refreshMediaItems();
  await refreshUsageInsight(items);
}

function handleDownloadTodo(): void {
  console.log("TODO: download selected or filtered media");
}

function isChecked(id: string): boolean {
  return selectedIds.has(id);
}

async function refreshUsageInsight(nextItems: MediaItem[]): Promise<void> {
  loadingUsageInsight = true;
  unusedItemsCount = await emulateApiFetchUnusedCount(nextItems);
  loadingUsageInsight = false;
}

async function fetchMediaList(): Promise<MediaItem[]> {
  const { mediaEntries } = await io.listMedia();
  return mediaEntries.map(({ meta, thumbnail }: { meta: StoredMediaMeta; thumbnail: ImageBitmap }) =>
    toMediaItem(meta, thumbnail),
  );
}

async function refreshMediaItems(): Promise<void> {
  const nextItems = await fetchMediaList();
  items = nextItems;
  selectedIds = new Set([...selectedIds].filter((id) => nextItems.some((item) => item.id === id)));
}

async function emulateApiFetchUnusedCount(items: MediaItem[]): Promise<number> {
  await delay(120);

  return items.reduce((count, item) => {
    const lastCharCode = item.id.charCodeAt(item.id.length - 1);
    return count + (lastCharCode % 3 === 0 ? 1 : 0);
  }, 0);
}

function toMediaItem(meta: StoredMediaMeta, thumbnailBitmap: ImageBitmap): MediaItem {
  const ext = getFileExtension(meta.filename);
  const kind = extensionToMediaKind(ext);
  const [width, height] = meta.dimension ?? [thumbnailBitmap.width, thumbnailBitmap.height];

  return {
    id: meta.id,
    displayName: meta.filename,
    filename: meta.filename,
    width,
    height,
    sizeLabel: formatByteSize(meta.byteSize),
    kind,
    addedAt: meta.updatedAt,
    addedAgoLabel: formatDurationAgo(meta.updatedAt),
    thumbnailBitmap,
  };
}

// TODO: Move to a shared common formatting library once media manager + inspector reuse it.
function getFileExtension(filename: string): string {
  return (filename.split(".").pop() || "png").toUpperCase();
}

// TODO: Move to a shared common formatting library once media manager + inspector reuse it.
function formatByteSize(byteSize: number): string {
  if (byteSize < 1024) return `${byteSize} B`;
  if (byteSize < 1024 * 1024) return `${(byteSize / 1024).toFixed(1)} KB`;
  if (byteSize < 1024 * 1024 * 1024) return `${(byteSize / (1024 * 1024)).toFixed(2)} MB`;
  return `${(byteSize / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// TODO: Move to a shared common formatting library once media manager + inspector reuse it.
function formatDurationAgo(epochMs: number): string {
  const deltaSec = Math.max(0, Math.floor((Date.now() - epochMs) / 1000));
  if (deltaSec < 60) return `${deltaSec}s ago`;
  const mins = Math.floor(deltaSec / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function extensionToMediaKind(ext: string): MediaItem["kind"] {
  if (ext === "JPG" || ext === "JPEG") return "JPG";
  if (ext === "WEBP") return "WEBP";
  if (ext === "MP4") return "MP4";
  return "PNG";
}

function sortItems(
  items: MediaItem[],
  mode: "date-desc" | "date-asc" | "name-asc",
): MediaItem[] {
  const copy = [...items];
  if (mode === "date-desc") return copy.sort((a, b) => b.addedAt - a.addedAt);
  if (mode === "date-asc") return copy.sort((a, b) => a.addedAt - b.addedAt);
  return copy.sort((a, b) => a.displayName.localeCompare(b.displayName));
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
</script>

<div class="shell">
  <section class="modal" data-debug-name="MediaManager.modal">
    <header class="header">
      <div>
        <h2>Image Uploader</h2>
        <p>Upload, manage, and organize your images</p>
      </div>
      <button class="xbtn" onclick={handleClose} aria-label="Close">X</button>
    </header>

    <div class="dropzone-wrap">
      <FileDropZone onUpload={handleUpload} />
    </div>

    <section class="media-panel">
      <div class="panel-head">
        <h3>Uploaded Images ({orderedItems.length})</h3>

        <div class="controls">
          <button
            class="toolbar-btn"
            onclick={handleRefresh}
            title="Refresh media list"
          >
            Refresh
          </button>

          <button
            class="toolbar-btn"
            onclick={handleDownloadTodo}
            title="Download media"
          >
            Download
          </button>

          <label>
            <span>Sort by</span>
            <select bind:value={sortBy}>
              <option value="date-desc">Date Added</option>
              <option value="date-asc">Date Added (Oldest)</option>
              <option value="name-asc">Name</option>
            </select>
          </label>

          <button
            class="toolbar-btn danger"
            onclick={handleDeleteSelected}
            disabled={selectedCount === 0}
            title="Delete selected"
          >
            Delete ({selectedCount})
          </button>

          <div class="mode-toggle">
            <button
              class:active={viewMode === "list"}
              onclick={() => (viewMode = "list")}
              title="List view"
            >LIST</button>
            <button
              class:active={viewMode === "grid"}
              onclick={() => (viewMode = "grid")}
              title="Grid view"
            >GRID</button>
          </div>
        </div>
      </div>

      {#if loading}
        <div class="loading">Loading media...</div>
      {:else if orderedItems.length === 0}
        <div class="placeholder-empty">
          <img src="/images/placeholder.webp" alt="No media placeholder" loading="lazy" />
          <h4>No media items yet</h4>
          <p>There is currently no item. Start uploading some to begin with.</p>
        </div>
      {:else if viewMode === "list"}
        <div class="table-wrap">
          <div class="table-head">
            <div>PREVIEW</div>
            <div>NAME</div>
            <div>DIMENSIONS</div>
            <div>SIZE</div>
            <div>TYPE</div>
            <div>ADDED</div>
            <div>ACTIONS</div>
          </div>
          {#each orderedItems as item (item.id)}
            <MediaManagerListItem
              {item}
              checked={isChecked(item.id)}
              oncheck={handleCheckbox}
              ondelete={handleDeleteOne}
              onmenu={handleTodoMenu}
            />
          {/each}
        </div>
      {:else}
        <div class="grid-wrap">
          {#each orderedItems as item (item.id)}
            <MediaManagerGridItem
              {item}
              checked={isChecked(item.id)}
              oncheck={handleCheckbox}
              ondelete={handleDeleteOne}
              onmenu={handleTodoMenu}
            />
          {/each}
        </div>
      {/if}
    </section>

    <footer class="status-bar">
      <div class="status-copy">
        <span class="status-kicker">Library status</span>
        <p>
          <span class="status-label">Status:</span>
          {#if loadingUsageInsight}
            checking which media are still referenced by the pipeline...
          {:else if unusedItemsCount > 0}
            {selectedCount} item(s) selected for deletion. {unusedItemsCount} {unusedItemsCount === 1 ? "asset appears" : "assets appear"} unused in the current pipeline and ready for cleanup review.
          {:else}
            {selectedCount} item(s) selected for deletion. All uploaded media appear to still be referenced in the current pipeline.
          {/if}
        </p>
      </div>
    </footer>

  </section>
</div>

<style>
.shell {
  position: fixed;
  inset: 0;
  padding: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  width: 100%;
  max-width: 70.625rem;
  height: min(48.75rem, calc(100vh - 2.6rem));
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-default);
  background:
    radial-gradient(circle at 25% 0, color-mix(in srgb, var(--color-bg-4) 60%, transparent), transparent 45%),
    radial-gradient(circle at 90% 15%, color-mix(in srgb, var(--color-bg-3) 45%, transparent), transparent 36%),
    var(--surface-panel);
  box-shadow: var(--shadow-lg);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem 1.2rem 0.85rem;
  border-bottom: 1px solid var(--border-subtle);
}

h2 {
  margin: 0;
  font-family: "Public Sans", "Segoe UI", sans-serif;
  font-size: 1.8rem;
  letter-spacing: 0.01em;
}

h3 {
  margin: 0;
  font-family: "Public Sans", "Segoe UI", sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
}

p {
  margin: 0.3rem 0 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.xbtn {
  background: var(--interactive-muted-bg);
  border: 1px solid var(--border-default);
  color: var(--interactive-muted-text);
  border-radius: var(--radius-lg);
  width: 34px;
  height: 34px;
  cursor: pointer;
}

.xbtn:hover {
  background: var(--interactive-muted-bg-hover);
}

.dropzone-wrap {
  padding: 1rem 1.2rem 0.8rem;
}

.media-panel {
  flex: 1;
  min-height: 0;
  padding: 0 1.2rem 0.8rem;
  display: flex;
  flex-direction: column;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  gap: 0.7rem;
}

.controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

select {
  background: var(--surface-panel);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  padding: 0.35rem 0.55rem;
}

.toolbar-btn {
  background: var(--interactive-muted-bg);
  color: var(--interactive-muted-text);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  height: 34px;
  padding: 0 0.7rem;
  cursor: pointer;
}

.toolbar-btn:hover:not(:disabled) {
  background: var(--interactive-muted-bg-hover);
}

.toolbar-btn.danger {
  color: var(--text-danger);
}

.toolbar-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.mode-toggle {
  display: inline-flex;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.mode-toggle button {
  border: 0;
  background: var(--surface-panel);
  color: var(--text-secondary);
  width: 60px;
  height: 34px;
  cursor: pointer;
}

.mode-toggle button:hover {
  background: var(--surface-elevated);
}

.mode-toggle button.active {
  background: var(--color-flip-bg-1);
  color: var(--color-flip-text-hi-con);
}

.loading {
  display: grid;
  place-items: center;
  min-height: 260px;
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
}

.placeholder-empty {
  display: grid;
  place-items: center;
  gap: 0.45rem;
  min-height: 260px;
  padding: 1rem;
  text-align: center;
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
}

.placeholder-empty img {
  width: min(18rem, 70%);
  height: auto;
  opacity: 0.95;
}

.placeholder-empty h4 {
  margin: 0.15rem 0 0;
  font-family: "Public Sans", "Segoe UI", sans-serif;
  font-size: 1.06rem;
  color: var(--text-primary);
}

.placeholder-empty p {
  margin: 0;
  max-width: 30rem;
}

.table-wrap {
  min-height: 0;
  overflow: auto;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
}

.table-head {
  display: grid;
  grid-template-columns: minmax(190px, 2.2fr) minmax(220px, 2.8fr) 1.2fr 0.95fr 0.75fr 1.1fr 0.9fr;
  gap: 0;
  min-height: 42px;
  align-items: center;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-tertiary);
  font-size: 0.73rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  padding-left: 0.6rem;
}

.grid-wrap {
  min-height: 0;
  overflow: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(208px, 1fr));
  gap: 0.85rem;
  padding: 0.1rem;
}

.status-bar {
  padding: 0.95rem 1.2rem 1.7rem;
  border-top: 1px solid var(--border-subtle);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--surface-panel) 80%, transparent), var(--surface-elevated)),
    radial-gradient(circle at 0 0, color-mix(in srgb, var(--color-bg-4) 30%, transparent), transparent 40%);
}

.status-copy {
  min-width: 0;
}

.status-kicker {
  display: inline-block;
  margin-bottom: 0.35rem;
  color: var(--text-tertiary);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.status-copy p {
  margin-top: 0.1rem;
  max-width: 50rem;
  font-size: 0.84rem;
}

.status-label {
  color: var(--text-primary);
  font-weight: 600;
}

@media (max-width: 900px) {
  .modal {
    height: min(55rem, calc(100vh - 2.6rem));
  }

  .panel-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .table-wrap {
    overflow-x: auto;
  }

  .table-head {
    width: 980px;
  }

  .status-bar {
    padding-bottom: 1.45rem;
  }
}
</style>
