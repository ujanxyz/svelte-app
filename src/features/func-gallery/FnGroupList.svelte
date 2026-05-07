<script lang="ts">
import type { fn } from "@/types/function";

import CollapsibleDrawer from "../../components/CollapsibleDrawer.svelte";

let drawerApi: { closeDrawer: () => void } | null = $state.raw(null);

interface CategoryEntry {
  category: string; // "/gen" or "All"
  count: number;
}

interface GalleryFunctionEntry {
  info: fn.FunctionInfo;
  category: string;
}

interface Props {
  entries: GalleryFunctionEntry[];
  /** Initial active category filter, null = "All". */
  initialFilterCategory?: string | null;
  /** Notifies parent when selection changes. */
  onFilterChange?: (category: string | null) => void;
}

const {
  entries,
  initialFilterCategory = null,
  onFilterChange,
}: Props = $props();

let selectedFilter = $state<string | null>(initialFilterCategory);

function setFilter(category: string | null) {
  selectedFilter = category;
  onFilterChange?.(category);
  drawerApi?.closeDrawer();
}

export function clearFilter(): void {
  setFilter(null);
}

/**
 * Derives category entries from function URIs.
 * URI format: "/category/function-name" → category is "/category".
 */
const categories = $derived.by((): CategoryEntry[] => {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    counts.set(entry.category, (counts.get(entry.category) ?? 0) + 1);
  }
  const sorted = [...counts.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([category, count]) => ({ category, count }));
  return sorted;
});
</script>

<CollapsibleDrawer bind:this={drawerApi} title="Categories" panelClass="fn-group-panel">
  <nav class="group-list" aria-label="Function categories">
    <!-- "All" entry -->
    <button
      class="group-entry all-entry"
      class:active={selectedFilter === null}
      onclick={() => setFilter(null)}
    >
      <span class="entry-label bold">All</span>
      <span class="entry-count">({entries.length})</span>
    </button>

    <hr class="entry-sep" />

    <!-- Per-category entries -->
    {#each categories as entry}
      <button
        class="group-entry"
        class:active={selectedFilter === entry.category}
        onclick={() => setFilter(entry.category)}
      >
        <span class="entry-label">{entry.category}</span>
        <span class="entry-count">({entry.count})</span>
      </button>
    {/each}
  </nav>
</CollapsibleDrawer>

<style>
/* Tinted panel background — applied via panelClass on CollapsibleDrawer */
:global(.fn-group-panel) {
  background: var(--tint-blue);
}

.group-list {
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
}

.group-entry {
  display: flex;
  align-items: baseline;
  gap: 0.3em;
  width: 100%;
  padding: 0.3rem 0.85rem;
  border: none;
  background: transparent;
  color: var(--text-primary, var(--color-text-hi-con));
  font-size: 0.83rem;
  text-align: left;
  cursor: pointer;
  border-radius: 0;
  transition: background 0.1s ease;
}

.group-entry:hover {
  background: color-mix(in srgb, var(--color-text-hi-con) 8%, transparent);
}

.group-entry.active {
  background: color-mix(in srgb, var(--color-accent, #fc3dff) 15%, transparent);
  color: var(--text-primary);
}

.entry-label {
  flex: 1 1 0%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entry-label.bold {
  font-weight: 700;
}

.entry-count {
  flex-shrink: 0;
  font-size: 0.78rem;
  color: var(--text-secondary, var(--color-text-md-con));
}

.entry-sep {
  border: none;
  border-top: 1px solid var(--color-border-subtle);
  margin: 0.3rem 0.6rem;
}
</style>
