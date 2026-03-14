<script lang="ts">
import type { UjNodeData, UjOverrideData } from "../types";
import { slotStore } from "../data/slot-store";
import NodeSlot from "./NodeSlot.svelte";

// Derive the param types without explicitly importing.
type InParam = UjNodeData["ins"][number];
type OutParam = UjNodeData["outs"][number];
type InOutParam = UjNodeData["inouts"][number];

interface Props {
  nodeId: string;
  ins: InParam[];
  outs: OutParam[];
  inouts: InOutParam[];
}

const { nodeId, ins, outs, inouts }: Props = $props();

function onDataEntry(slotName: string, data: UjOverrideData): void {
  console.log(slotName, data);
  slotStore.setOverride(nodeId, slotName, true, data);
}

function onDataLookup(slotName: string): UjOverrideData | null {
  return slotStore.lookupOverride(nodeId, slotName);
}
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
  {@const slotInfoIn = slotStore.useSlotInfo(nodeId, param.name)}
  <NodeSlot access="in" {param} {slotInfoIn} {onDataEntry} {onDataLookup} />
{/snippet}

{#snippet outSlot(param: OutParam)}
  {@const slotInfoOut = slotStore.useSlotInfo(nodeId, param.name)}
  <NodeSlot access="out" {param} {slotInfoOut} {onDataEntry} {onDataLookup} />
{/snippet}

{#snippet inoutSlot(param: InOutParam)}
  {@const slotInfoIn = slotStore.useSlotInfo(nodeId, param.name + "/in")}
  {@const slotInfoOut = slotStore.useSlotInfo(nodeId, param.name + "/out")}
  <NodeSlot
    access="inout"
    {param}
    {slotInfoIn}
    {slotInfoOut}
    {onDataEntry}
    {onDataLookup}
  />
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
</style>
