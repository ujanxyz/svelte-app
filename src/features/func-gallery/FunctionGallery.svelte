<script lang="ts">
import { getContext, onMount } from "svelte";

import SearchInputBox from "@/components/SearchInputBox.svelte";
import TextIconPill from "@/components/TextIconPill.svelte";
import { OverlayCloseButton, useOverlayInstance } from "@/modules/overlay2";
import MoveButton from "@/modules/overlay2/MoveButton.svelte";
import { type fn } from "@/types/function";
import { GraphWorkerApi } from "@/webworkerclient/GraphWorkerApi";

import { fetchFnInfos } from "./apiFunctionInfos";
import FnGroupList from "./FnGroupList.svelte";
import FunctionCard from "./FunctionCard.svelte";

interface GalleryFunctionEntry {
  info: fn.FunctionInfo;
  category: string;
}

const graph = getContext(GraphWorkerApi.CONTEXT_KEY) as GraphWorkerApi;
const { fetchItemsAsync, abortFetch } = fetchFnInfos(graph);

let searchText = $state("");
let filterCategory = $state<string | null>(null);
let allEntries = $state.raw<GalleryFunctionEntry[]>([]);

let isLoading = $state(false);
let loadError = $state<string | null>(null);

let fnGroupListApi = $state.raw<{ clearFilter: () => void } | null>(null);

const normalizedSearchText = $derived(searchText.trim().toLowerCase());
const filteredEntries = $derived.by(() => {
  return allEntries.filter((entry) => {
    const matchesCategory = !filterCategory || entry.category === filterCategory;
    if (!matchesCategory) return false;

    if (!normalizedSearchText) return true;

    const label = entry.info.label.toLowerCase();
    const uri = entry.info.uri.toLowerCase();
    return label.includes(normalizedSearchText) || uri.includes(normalizedSearchText);
  });
});

const filteredItems = $derived(filteredEntries.map((entry) => entry.info));

function extractCategory(uri: string): string {
  const parts = uri.split("/");
  return parts.length >= 2 && parts[1] ? `/${parts[1]}` : "/other";
}

async function loadFunctions(): Promise<void> {
  isLoading = true;
  loadError = null;
  try {
    const items = await fetchItemsAsync();
    allEntries = items.map((info) => ({ info, category: extractCategory(info.uri) }));
  } catch (err) {
    if ((err as Error).name !== "AbortError") {
      loadError = (err as Error).message;
    }
  } finally {
    isLoading = false;
  }
}

onMount(() => {
  void loadFunctions();
  return () => abortFetch();
});

function handleUpdateSearchText(text: string): void {
  searchText = text;
}

function handleFilterChange(category: string | null) {
  filterCategory = category;
}

function clearGroupFilter() {
  fnGroupListApi?.clearFilter();
  filterCategory = null;
}

const overlay = useOverlayInstance<{}, fn.FunctionInfo | fn.GraphIoInfo>();

function onSelect(spec: fn.FunctionInfo) {
  overlay.settle(spec);
}
</script>

<div class={["shell", "gallery-main"]}>
  <div class="topbar">
    <h2 class="header-l1">Pick a function</h2>
    <div class="flex-remaining"></div>
    <MoveButton size={32} />
    <span style="width: var(--space-6)"></span>
    <SearchInputBox placeholder="Search function" onUpdateText={handleUpdateSearchText} />
    <span style="width: var(--space-6)"></span>
    <OverlayCloseButton />
  </div>
  <!-- Filter bar: always rendered at fixed height to prevent layout shift -->
  <div class="filter-bar">
    {#if filterCategory}
      <TextIconPill text={filterCategory} icon="x" onClick={clearGroupFilter} />
    {/if}
    {#if !filterCategory}
      <span class="filter-bar-empty">Showing all functions</span>
    {/if}
  </div>

  <div class="fn-view-container">
    {#if isLoading}
      <p class="status-label">Loading...</p>
    {:else if loadError}
      <p class="error-label">{loadError}</p>
    {:else}
      <FnGroupList
        bind:this={fnGroupListApi}
        entries={allEntries}
        initialFilterCategory={filterCategory}
        onFilterChange={handleFilterChange}
      />
      <div class="contentroot">
        <div class="gridbox">
          {#if filteredItems.length === 0}
            <p class="empty-label">No functions match the current filters.</p>
          {/if}
          {#each filteredItems as item (item.uri)}
            <FunctionCard spec={item} {onSelect} />
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
.shell {
  position: fixed;
  inset: 0;
  min-width: 160px;
}
.gallery-main {
  width: calc(100vw - 48px);
  height: calc(100vh - 48px);
  max-width: 800px;
  max-height: 1200px;

  margin: 24px auto;
  background: var(--color-bg-0);
  border: 2px solid var(--border-strong);
  border-radius: var(--radius-xl);

  display: flex;
  flex-direction: column;
  align-items: stretch;
  overflow: hidden;
}
@media (max-width: 1200px) {
  .gallery-main {
    min-width: 600px;
  }
}

.topbar {
  padding: 12px 12px 12px 24px;
  font-weight: 400;
  line-height: 1.43;

  display: flex;
  align-items: center;
}

.header-l1 {
  font-size: 1.25rem;
  font-weight: bold;
  line-height: 1.2;
}

.flex-remaining {
  flex: 1 1 0%;
}

/* ── Filter bar: fixed height, always rendered ───────────────────── */
.filter-bar {
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.85rem;
  border-bottom: 1px solid var(--color-border-subtle);
  gap: var(--space-2);
  flex-shrink: 0;
  overflow: hidden;
}

.filter-bar-empty {
  font-size: 0.78rem;
  color: var(--color-text-lo-con, var(--color-text-tertiary));
  user-select: none;
}

/* ── Function view container ──────────────────────────────────────── */
.fn-view-container {
  flex: 1 1 0%;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.status-label,
.error-label {
  margin: 1rem;
  color: var(--color-text-md-con);
}

.error-label {
  color: var(--color-text-error);
}

/* ── Inlined from FuncTemplatesView ─────────────────────────────── */
.contentroot {
  flex: 1 1 0%;
  overflow-y: auto;
  display: flex;
  align-items: stretch;
  flex-direction: column;
}

.gridbox {
  width: 100%;
  max-height: 100%;
  flex: 1;
  align-self: flex-start;
  padding: var(--space-6) 0px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  align-content: flex-start;
  flex-wrap: wrap;
  overflow-y: auto;
  row-gap: var(--space-6);
  column-gap: var(--space-6);
}

.empty-label {
  margin-top: 24px;
  color: var(--color-text-md-con);
  font-size: 0.9rem;
}
</style>
