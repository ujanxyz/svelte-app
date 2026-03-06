<script lang="ts">
import MyHandle from "./MyHandle.svelte";

interface Slots {
  ins: string[];
  outs: string[];
  ios: string[];
}

interface Props {
  slots: Slots;
}

let nextId = 0;
function getNodeId() {
  return `n-${++nextId}`;
}
</script>

<div class="flex-fitted-rows">
  {@render inSlot()}
  {@render inSlot()}
  {@render inSlot()}
  {@render outSlot()}
  {@render outSlot()}
  {@render inoutSlot()}
  {@render inoutSlot()}
</div>

{#snippet inSlot()}
  <div class="slot rounded-sm flex-fitted-cells">
    <span class="label rounded-sm">Slot 2</span>
    <MyHandle kind="in" id={getNodeId()} />
    <MyHandle kind="out-x" />
  </div>
{/snippet}

{#snippet outSlot()}
  <div class="slot rounded-sm flex-fitted-cells">
    <span class="label rounded-sm">Slot 2</span>

    <MyHandle kind="in-x" />
    <MyHandle kind="out" id={getNodeId()} />
  </div>
{/snippet}

{#snippet inoutSlot()}
  <div class="slot rounded-sm flex-fitted-cells">
    <span class="label rounded-sm">Slot 2</span>
    <MyHandle kind="in" id={getNodeId()} />
    <MyHandle kind="out" id={getNodeId()} />
  </div>
{/snippet}

<style>
.flex-fitted-rows {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: stretch;
  row-gap: var(--space-1);
}
.slot {
  position: relative;
  /* margin-left: var(--space-2);
  margin-right: var(--space-2); */
  /* padding-left: var(--space-3);
  padding-right: var(--space-3); */
}
.flex-fitted-cells {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  column-gap: var(--space-2);
}
.label {
  background-color: #3a516c;
  flex-grow: 1;
  margin-left: calc(var(--space-4) + 4px);
  margin-right: calc(var(--space-4) + 4px);
  padding: var(--space-1) var(--space-2);
  text-align: start;
}
</style>
