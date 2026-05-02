<script lang="ts" module>
export interface MediaManagerPayload {
  preselectedIds?: string[];
}
</script>

<script lang="ts">
import { onMount } from "svelte";

import FileDropZone from "@/components/FileDropZone.svelte";
import { useOverlayInstance } from "@/modules/overlay2";

import MediaManagerGridItem from "./MediaManagerGridItem.svelte";
import MediaManagerListItem from "./MediaManagerListItem.svelte";
import type { MediaItem, MediaViewMode } from "./mediaManagerTypes";

const overlay = useOverlayInstance<MediaManagerPayload, never>();

let items = $state<MediaItem[]>([]);
let loading = $state(true);
let sortBy = $state<"date-desc" | "date-asc" | "name-asc">("date-desc");
let viewMode = $state<MediaViewMode>("list");
let selectedIds = $state(new Set<string>());
let unusedItemsCount = $state(0);
let loadingUsageInsight = $state(true);
const orderedItems = $derived(sortItems(items, sortBy));
const selectedCount = $derived(selectedIds.size);

onMount(async () => {
  items = await fetchInitialDummyMedia();
  const preselectedIds = overlay.payload?.preselectedIds;
  if (Array.isArray(preselectedIds) && preselectedIds.length > 0) {
    selectedIds = new Set(preselectedIds);
  }
  await refreshUsageInsight(items);
  loading = false;
});

async function handleUpload(files: File[]): Promise<void> {
  const [uploaded] = files;
  if (!uploaded) return;

  const newItem = await emulateApiCreate(uploaded);
  items = [newItem, ...items];
  await refreshUsageInsight(items);
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
  await emulateApiDelete();
  items = items.filter((item) => item.id !== id);

  const next = new Set(selectedIds);
  next.delete(id);
  selectedIds = next;

  await refreshUsageInsight(items);
}

async function handleDeleteSelected(): Promise<void> {
  if (selectedIds.size === 0) return;
  await emulateApiDelete();
  items = items.filter((item) => !selectedIds.has(item.id));
  selectedIds = new Set();

  await refreshUsageInsight(items);
}

function handleTodoMenu(id: string): void {
  console.log("TODO: add item menu actions for", id);
}

function handleRefreshTodo(): void {
  console.log("TODO: refresh media manager items");
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

// TODO: replace i.pravatar thumbnails with real image/video previews once backend thumbnail endpoint is ready.
async function fetchInitialDummyMedia(): Promise<MediaItem[]> {
  await delay(100);
  return [
    mkItem(
      "m1",
      "Mountains_Lake.jpg",
      "mountains_lake.jpg",
      2560,
      1440,
      "2.34 MB",
      "JPG",
      "2 minutes ago",
    ),
    mkItem(
      "m2",
      "Abstract_Waves.png",
      "abstract_waves.png",
      1920,
      1080,
      "1.45 MB",
      "PNG",
      "1 hour ago",
    ),
    mkItem(
      "m5",
      "Sunset_Beach.png",
      "sunset_beach.png",
      2048,
      1365,
      "1.08 MB",
      "PNG",
      "2 days ago",
    ),
    mkItem(
      "m6",
      "Snow_Mountain.webp",
      "snow_mountain.webp",
      3840,
      2160,
      "2.67 MB",
      "WEBP",
      "3 days ago",
    ),
  ];
}

async function emulateApiCreate(file: File): Promise<MediaItem> {
  await delay(100);
  const ext = (file.name.split(".").pop() || "png").toUpperCase();
  const kind =
    ext === "JPG" || ext === "JPEG"
      ? "JPG"
      : ext === "WEBP"
        ? "WEBP"
        : ext === "MP4"
          ? "MP4"
          : "PNG";
  return mkItem(
    crypto.randomUUID(),
    file.name,
    file.name,
    1920,
    1080,
    `${Math.max(0.1, file.size / (1024 * 1024)).toFixed(2)} MB`,
    kind,
    "Just now",
  );
}

async function emulateApiDelete(): Promise<void> {
  await delay(100);
}

async function emulateApiFetchUnusedCount(items: MediaItem[]): Promise<number> {
  await delay(120);

  return items.reduce((count, item) => {
    const lastCharCode = item.id.charCodeAt(item.id.length - 1);
    return count + (lastCharCode % 3 === 0 ? 1 : 0);
  }, 0);
}

function mkItem(
  id: string,
  displayName: string,
  filename: string,
  width: number,
  height: number,
  sizeLabel: string,
  kind: MediaItem["kind"],
  addedAgoLabel: string,
): MediaItem {
  return {
    id,
    displayName,
    filename,
    width,
    height,
    sizeLabel,
    kind,
    addedAt: Date.now() - Math.floor(Math.random() * 10_000_000),
    addedAgoLabel,
    thumbnailUrl: `https://i.pravatar.cc/100?u=${Math.random()}-${id}`,
  };
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
      <FileDropZone onupload={handleUpload} />
    </div>

    <section class="media-panel">
      <div class="panel-head">
        <h3>Uploaded Images ({orderedItems.length})</h3>

        <div class="controls">
          <button
            class="toolbar-btn"
            onclick={handleRefreshTodo}
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
        <div class="loading">No media uploaded yet.</div>
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
