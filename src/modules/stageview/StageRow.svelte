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

<button class={`stage-row ${state}`} onclick={handleClick}>
  <div class="stage-header">{stage.label}</div>

  <div class="slots">
    <div class="inputs">
      {#each stage.inputs as slot}
        <div class="slot">
          <span class="slot-name">{slot.name}</span>
          <span class="slot-type">{slot.type}</span>
        </div>
      {/each}
    </div>

    <div class="outputs">
      {#each stage.outputs as slot}
        <div class="slot">
          <span class="slot-name">{slot.name}</span>
          <span class="slot-type">{slot.type}</span>
        </div>
      {/each}
    </div>
  </div>
</button>

<style>
.stage-row {
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
  margin: 6px 0;
  cursor: pointer;
  background: white;
}

.stage-header {
  font-weight: 600;
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
  gap: 2px;
}

.slot {
  font-size: 12px;
  display: flex;
  gap: 6px;
}

.slot-type {
  color: #777;
}

/* Highlight states */

.stage-row.selected {
  background: #77a0d6;
  border-color: #4c8bf5;
}

.stage-row.upstream {
  background: #69ce82;
  border-color: #34a853;
}

.stage-row.downstream {
  background: #e6a96c;
  border-color: #f2994a;
}
</style>
