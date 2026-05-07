<script lang="ts" module>
type Ntype = "FN" | "IN" | "OUT";

export interface FnGalleryPayload {
  ntype: Ntype;
}
</script>

<script lang="ts">
import { getContext, onMount } from "svelte";

import SearchInputBox from "@/components/SearchInputBox.svelte";
import TextIconPill from "@/components/TextIconPill.svelte";
import { OverlayCloseButton } from "@/modules/overlay2";
import MoveButton from "@/modules/overlay2/MoveButton.svelte";
import { type fn } from "@/types/function";
import type { PipelineBuilder } from "@/webworkerclient/PipelineBuilder";

import { fetchFnInfos } from "./apiFunctionInfos";
import FnGroupList from "./FnGroupList.svelte";
import FuncTemplatesView from "./FuncTemplatesView.svelte";

interface GalleryFunctionEntry {
  info: fn.FunctionInfo;
  category: string;
}

const pipeline = getContext(Symbol.for("PipelineBuilder")) as PipelineBuilder;
const { fetchItemsAsync, abortFetch } = fetchFnInfos(pipeline);

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
      <FuncTemplatesView items={filteredItems} />
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
  gap: 0.5rem;
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
</style>
