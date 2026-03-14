<script lang="ts">
import type { PipelineStage } from "./types";

interface Props {
  stage: PipelineStage;
  onSelect?: (id: string) => void;
  selected?: boolean;
  upstream?: boolean;
  downstream?: boolean;
}

const {
  stage,
  onSelect,
  selected = false,
  upstream = false,
  downstream = false,
}: Props = $props();

function handleClick() {
  onSelect?.(stage.id);
}

const state = $derived(
  selected
    ? "selected"
    : upstream
      ? "upstream"
      : downstream
        ? "downstream"
        : "normal",
);
</script>

<button
  class={["row", state]}
  onclick={handleClick}
  data-debug-name="stage-view-row"
>
  <div class="header" data-debug-name="stage-view-header">{stage.label}</div>
  <div class="slots" data-debug-name="stage-view-slots">
    <div class="inputs">
      {#each stage.inputs as slot}
        <div class="slot" data-debug-name="stage-view-slot">
          <span class="slot-name">{slot.name}</span>
          <span class="slot-type">{slot.type}</span>
        </div>
      {/each}
    </div>
    <div class="outputs">
      {#each stage.outputs as slot}
        <div class="slot" data-debug-name="stage-view-slot">
          <span class="slot-name">{slot.name}</span>
          <span class="slot-type">{slot.type}</span>
        </div>
      {/each}
    </div>
  </div>
</button>

<style>
.row {
  width: 100%;
  border-radius: 4px;
  border: 1px solid #ddd;
  cursor: pointer;
}
.header {
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 6px;
}
.slots {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.inputs,
.outputs {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.slot {
  font-size: 10px;
  display: flex;
  gap: 6px;
  padding: 2px 4px;
  border-radius: 2px;
  /* background-color: #d6ba9d; */
}
.slot:hover {
  background-color: #e6a96c;
}
.slot-name {
  font-weight: 600;
  color: #484848;
}
.slot-type {
  color: #7d7d7d;
}

/* Highlight states */

.row.selected {
  background: #aabfd9;
  border-color: #4c8bf5;
}

.row.upstream {
  background: #a8cbb1;
  border-color: #34a853;
}

.row.downstream {
  background: rgb(202, 183, 163);
  border-color: #f2994a;
}
</style>
