<script lang="ts">
import MyHandle from "./MyHandle.svelte";
import type { NodeDetailsData } from "./types";

// Derive the param types without explicitly importing.
type InParam = NodeDetailsData["ins"][number];
type OutParam = NodeDetailsData["outs"][number];
type InOutParam = NodeDetailsData["inouts"][number];

interface Props {
  ins: InParam[];
  outs: OutParam[];
  inouts: InOutParam[];
}

const { ins, outs, inouts }: Props = $props();
</script>

<div class="flex-fitted-rows">
  {#each ins as param (param.name)}
    {@render inSlot(param)}
  {/each}
  {#each outs as param (param.name)}
    {@render outSlot(param)}
  {/each}
  {#each inouts as param (param.name)}
    {@render inoutSlot(param)}
  {/each}
</div>

{#snippet inSlot(param: InParam)}
  {@const { name: paramName, type: paramType } = param}
  <div class="slot rounded-sm flex-fitted-cells">
    <span class="label rounded-sm" title={paramType}>{paramName}</span>
    <MyHandle kind="in" id={paramName} />
    <MyHandle kind="out-x" />
  </div>
{/snippet}

{#snippet outSlot(param: OutParam)}
  {@const { name: paramName, type: paramType } = param}
  <div class="slot rounded-sm flex-fitted-cells">
    <span class="label rounded-sm" title={paramType}>{paramName}</span>
    <MyHandle kind="in-x" />
    <MyHandle kind="out" id={paramName} />
  </div>
{/snippet}

{#snippet inoutSlot(param: InOutParam)}
  {@const { name: paramName, type: paramType } = param}
  <div class="slot rounded-sm flex-fitted-cells">
    <span class="label rounded-sm" title={paramType}>{paramName}</span>
    <MyHandle kind="in" id={paramName + "/in"} />
    <MyHandle kind="out" id={paramName + "/out"} />
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
  font-size: 0.5rem;
}
</style>
