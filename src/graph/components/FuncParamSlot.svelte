<script module lang="ts">
import type { AppIconCode } from "@/utils/appIcons";

const kDtypeToIcon: Record<string, AppIconCode> = {
  points2d: "shapes",
  bitmap: "image-square",
  floats: "list-numbers",
};

export { kDtypeToIcon };
</script>

<script lang="ts">
import type { Component } from "svelte";

import type { grph } from "@/types/grph";
import { getAppIcon } from "@/utils/appIcons";

import { getNodeContextOps } from "../nodes/nodeContextOps";

interface Props {
  slotInfo: grph.SlotInfo;
  slotState: grph.SlotState;
}

const { slotInfo, slotState }: Props = $props();

// TODO: Move this to parent.
const nodeOps = getNodeContextOps();

const dTypeIco = $derived(kDtypeToIcon[slotInfo.dtype] ?? "list-numbers");
const inIco = $derived.by(() => {
  if (slotInfo.access === "O") return "dot-outline";
  return slotState.inEdges.length > 0 ? "link-simple" : "brackets-square";
});
const outIco = $derived.by(() => {
  if (slotInfo.access === "I") return "dot-outline";
  return slotState.outEdges.length > 0 ? "link-simple" : "link-simple-break";
});

const DTypeIcon: Component = $derived(getAppIcon(dTypeIco));
const InStatusIcon: Component = $derived(getAppIcon(inIco));
const OutStatusIcon: Component = $derived(getAppIcon(outIco));

const canEdit = $derived(slotInfo.access !== "O");
const statusDisabled = $derived.by(() => {
  if (slotInfo.access === "I") return { in: true, out: false };
  if (slotInfo.access === "O") return { in: false, out: true };
  return { in: false, out: false };
});

async function onClickEdit(ev: MouseEvent): Promise<void> {
  if (!canEdit) return;
  ev.preventDefault();
  const anchor = ev.currentTarget as HTMLButtonElement;
  const rect = anchor.getBoundingClientRect();

  try {
    await nodeOps.onSlotInput(slotInfo, slotState, rect);
  } catch (err) {
    alert("TODO: slot manual editor context is not available in this view yet.");
    console.error(err);
  }
}

function onClickStatus(ev: MouseEvent): void {
  ev.preventDefault();
  alert("TODO: slot status context menu is not implemented yet.");
}
</script>

<div class="slot-grid">
  <button
    class="panebtn editbtn"
    onclick={onClickEdit}
    disabled={!canEdit}
    data-debug-name="slot-pane-btn"
  >
    <span class="dtype-icon" aria-label={slotInfo.dtype}>
      <DTypeIcon size={8} />
    </span>
    <span class="v-sep" aria-hidden="true"></span>
    <span class="slot-label" title={slotInfo.name}>{slotInfo.name}</span>
  </button>

  <button
    class="panebtn status-btn"
    onclick={onClickStatus}
    data-debug-name="slot-status-btn"
  >
    <span class="status-icon in-bg" class:empty={statusDisabled.in}>
        <InStatusIcon size={8} />
    </span>

    <span class="status-icon out-bg" class:empty={statusDisabled.out}>
      <OutStatusIcon size={8} />
    </span>
  </button>
</div>

<style>
.slot-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: stretch;
  column-gap: 0;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background-color: var(--color-bg-0);
  color: var(--color-text-hi-con);
}

.panebtn {
  border: none;
  /* padding: 0 var(--space-1); */
  text-align: start;
  background-color: transparent;
}

.editbtn {
  padding-left: var(--space-2);
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr);
  align-items: center;
  column-gap: var(--space-2);
  cursor: pointer;
}

.editbtn:disabled {
  cursor: default;
  color: var(--color-text-hi-con);
}

.editbtn:hover:not(:disabled) {
  background-color: var(--color-bg-1);
}

.status-btn {
  display: grid;
  grid-template-columns: auto auto;
  align-items: center;
  column-gap: 0.1rem;
  cursor: pointer;
}

.dtype-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-md-con);
}

.v-sep {
  width: 1px;
  height: 80%;
  background: var(--color-border-subtle);
}

.slot-label {
  min-width: 0;
  font-size: var(--font-size-3xs);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  /* color: var(--color-text-hi-con); */
}

.in-bg {
  background-color: var(--tint-blue-lo);
}
.out-bg {
  background-color: var(--tint-green-lo);
}

.status-btn:hover .status-icon:not(.empty).in-bg {
  background-color: var(--tint-blue-md);
}
.status-btn:hover .status-icon:not(.empty).out-bg {
  background-color: var(--tint-green-md);
}

.status-icon {
  width: 0.8rem;
  height: 0.8rem;
  margin: calc(0.5 * var(--space-1p)) 0;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-hi-con);
}

.status-icon.empty {
  background: transparent;
  color: var(--color-text-lo-con);
}
</style>
