<script lang="ts">
import { tick } from "svelte";

import { type fn } from "@/types/function";
import { getAppIcon } from "@/utils/appIcons";

import ParamChip from "./ParamChip.svelte";

interface Props {
  spec: fn.FunctionInfo;
  onSelect: (spec: fn.FunctionInfo) => void;
  selected?: boolean;
}

const {
  spec,
  onSelect,
  selected = false,
}: Props = $props();

const FunctionIcon = getAppIcon("function");
const params = $derived(spec.params ?? []);

let chipViewport: HTMLDivElement;
let chipMeasure: HTMLDivElement;
let visibleParamCount = $state(0);
let measuringParamCount = $state(0);
let showOverflowEllipsis = $state(false);
let measuringEllipsis = $state(false);
let resizeTicket = $state(0);

function handleClick(): void {
  onSelect(spec);
}

async function fitVisibleParams(): Promise<void> {
  await tick();
  if (!chipViewport || !chipMeasure) return;

  const availableHeight = chipViewport.clientHeight;
  if (availableHeight <= 0) return;

  measuringParamCount = params.length;
  measuringEllipsis = false;
  await tick();

  if (chipMeasure.scrollHeight <= availableHeight) {
    visibleParamCount = params.length;
    showOverflowEllipsis = false;
    return;
  }

  let fittedCount = 0;
  for (let count = params.length - 1; count >= 0; count -= 1) {
    measuringParamCount = count;
    measuringEllipsis = count < params.length;
    await tick();
    if (chipMeasure.scrollHeight <= availableHeight) {
      fittedCount = count;
      break;
    }
  }

  visibleParamCount = fittedCount;
  showOverflowEllipsis = fittedCount < params.length;
}

$effect(() => {
  params.length;
  spec.label;
  spec.desc;
  selected;
  resizeTicket;
  void fitVisibleParams();
});

$effect(() => {
  if (!chipViewport) return;

  const observer = new ResizeObserver(() => {
    resizeTicket += 1;
  });

  observer.observe(chipViewport);
  return () => observer.disconnect();
});
</script>

<button
  type="button"
  class="card"
  class:selected
  data-uj-fn-id={spec.uri}
  onclick={handleClick}
>
  <div class="header-row">
    <strong class="title">{spec.label}</strong>
    <span class="header-icon" aria-hidden="true">
      <FunctionIcon size={16} weight="regular" />
    </span>
  </div>

  <p class="description">{spec.desc}</p>

  <div class="chip-viewport" bind:this={chipViewport}>
    <div class="chip-tray">
      {#each params.slice(0, visibleParamCount) as param (param.name + param.dtype + param.access)}
        <ParamChip
          name={param.name}
          dtype={param.dtype}
          access={param.access}
          chipClass={selected ? "selected-chip" : ""}
        />
      {/each}
      {#if showOverflowEllipsis}
        <span class="chip-overflow" class:selected>{"..."}</span>
      {/if}
    </div>

    <div class="chip-measure" aria-hidden="true" bind:this={chipMeasure}>
      {#each params.slice(0, measuringParamCount) as param (param.name + param.dtype + param.access)}
        <ParamChip
          name={param.name}
          dtype={param.dtype}
          access={param.access}
          chipClass={selected ? "selected-chip" : ""}
        />
      {/each}
      {#if measuringEllipsis}
        <span class="chip-overflow" class:selected>{"..."}</span>
      {/if}
    </div>
  </div>
</button>

<style>
.card {
  width: 15rem;
  height: 8.75rem;
  box-sizing: border-box;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  gap: var(--space-2);
  padding: var(--space-4) var(--space-3);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--surface-elevated);
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
  overflow: hidden;
}

.card:hover {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 1px var(--color-accent);
}

.card:focus-visible {
  outline: 0;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px var(--color-accent);

  background: var(--color-flip-bg-2);
  color: var(--color-flip-text-hi-con);
}

.card.selected {
  background: var(--color-flip-bg-2);
  color: var(--color-flip-text-hi-con);
  border-color: var(--color-flip-border-default);
}

.header-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--space-3);
  align-items: start;
}

.title {
  margin: 0;
  min-width: 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold, 700);
  line-height: 1.15;
  color: inherit;
  overflow-wrap: anywhere;
}

.header-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.card.selected .header-icon {
  color: var(--color-flip-text-md-con);
}

.description {
  margin: 0;
  min-width: 0;
  font-size: var(--font-size-xs);
  line-height: 1.2;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card.selected .description {
  color: var(--color-flip-text-md-con);
}

.chip-viewport {
  position: relative;
  display: flex;
  align-items: flex-end;
  min-width: 0;
  min-height: 0;
  margin-top: var(--space-1);
  overflow: hidden;
}

.chip-tray,
.chip-measure {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  align-content: flex-end;
}

.chip-measure {
  position: absolute;
  inset: 0;
  visibility: hidden;
  pointer-events: none;
}

.chip-overflow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 22px;
  margin-right: 3px;
  margin-bottom: 3px;
  padding: 0 var(--space-2);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--surface-panel);
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  line-height: 1;
}

.chip-overflow.selected {
  border-color: var(--color-flip-border-subtle);
  background: var(--color-flip-bg-3);
  color: var(--color-flip-text-md-con);
}
</style>
