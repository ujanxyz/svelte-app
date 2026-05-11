<script lang="ts" module>
  import type { grph } from "@/types/grph";

type Ntype = grph.NodeInfo["ntype"];

export interface IoGalleryPayload {
  ntype: Ntype;
}
</script>

<script lang="ts">
import { OverlayCloseButton, useOverlayInstance } from "@/modules/overlay2";
import MoveButton from "@/modules/overlay2/MoveButton.svelte";

import IoCard from "./IoCard.svelte";

type IoMode = Extract<grph.NodeInfo["ntype"], "IN" | "OUT">;

interface IoTemplate {
  dtype: string;
  label: string;
  desc: string;
}

interface Props {
  initialMode?: IoMode;
}

const { initialMode = "IN" }: Props = $props();

const overlay = useOverlayInstance<IoGalleryPayload, string>();
const payloadMode = overlay.payload?.ntype === "OUT" ? "OUT" : "IN";

let mode = $state.raw<{ value: IoMode }>({
  value: payloadMode ?? initialMode,
});

const ioTemplates: IoTemplate[] = [
  {
    dtype: "floats",
    label: "floats",
    desc: "Continuous scalar values for thresholds, intensity curves, and controls used by procedural and simulation operations.",
  },
  {
    dtype: "points2d",
    label: "points2d",
    desc: "Two-dimensional coordinate streams for path generation, sampling patterns, and geometric transformations throughout graph pipelines.",
  },
  {
    dtype: "bitmap",
    label: "bitmap",
    desc: "Raster pixel buffers for textures and previews where color information is processed in image-space operations.",
  },
  {
    dtype: "colors",
    label: "colors",
    desc: "Color vector collections for palettes, gradients, and remapping workflows that require consistent chroma handling.",
  },
];

function setMode(next: IoMode): void {
  mode.value = next;
}

function onSelect(dtype: string): void {
  overlay.settle(dtype);
}
</script>

<div class={["shell", "gallery-main"]}>
  <div class="topbar">
    <h2 class="header-l1">Pick input / output</h2>
    <div class="flex-remaining"></div>
    <MoveButton size={32} />
    <span style="width: var(--space-6)"></span>
    <OverlayCloseButton />
  </div>

  <div class="mode-bar" role="tablist" aria-label="I/O type selector">
    <button
      type="button"
      role="tab"
      class="mode-pill"
      class:active={mode.value === "IN"}
      aria-selected={mode.value === "IN"}
      onclick={() => setMode("IN")}
    >
      Input
    </button>
    <button
      type="button"
      role="tab"
      class="mode-pill"
      class:active={mode.value === "OUT"}
      aria-selected={mode.value === "OUT"}
      onclick={() => setMode("OUT")}
    >
      Output
    </button>
  </div>

  <div class="contentroot">
    <div class="gridbox">
      {#each ioTemplates as item (item.dtype)}
        <IoCard
          dtype={item.dtype}
          label={item.label}
          desc={item.desc}
          onSelect={onSelect}
        />
      {/each}
    </div>
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

.mode-bar {
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0 0.85rem;
  border-bottom: 1px solid var(--color-border-subtle);
  flex-shrink: 0;
}

.mode-pill {
  height: 1.8rem;
  min-width: 5.5rem;
  padding: 0 0.75rem;
  border-radius: var(--radius-pill, 9999px);
  border: 1px solid var(--color-border-subtle);
  background: var(--surface-panel);
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease, border-color 0.12s ease;
}

.mode-pill:hover {
  background: var(--color-bg-2);
}

.mode-pill.active {
  background: color-mix(in srgb, var(--color-accent) 14%, transparent);
  color: var(--text-primary);
  border-color: color-mix(in srgb, var(--color-accent) 42%, var(--color-border-subtle));
}

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
  padding: var(--space-6) var(--space-8);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-content: flex-start;
  row-gap: var(--space-6);
  column-gap: var(--space-6);
  overflow-y: auto;
}

@media (max-width: 760px) {
  .gridbox {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
