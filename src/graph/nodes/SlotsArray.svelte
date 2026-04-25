<script lang="ts">
import type { plinfo } from "@/types/plinfo";

import type { UjOverrideData } from "../types";
import type { NodeContextOps } from "./nodeContextOps";
import NodeSlot from "./NodeSlot.svelte";

interface Props {
  ins: plinfo.SlotInfo[];
  outs: plinfo.SlotInfo[];
  inouts: plinfo.SlotInfo[];
  nodeOps: NodeContextOps;
}

const { ins, outs, inouts, nodeOps }: Props = $props();

function onDataEntry(slotName: string, data: UjOverrideData): void {
  throw new Error("[onDataEntry] Not implemented");
}

function onDataLookup(slotName: string): UjOverrideData | null {
    throw new Error("[onDataLookup] Not implemented");
}

</script>

<div class="flex-fitted-rows">
  {#each ins as slot (slot.name)}
    {@render inSlot(slot)}
  {/each}
  {#each outs as slot (slot.name)}
    {@render outSlot(slot)}
  {/each}
  {#each inouts as slot (slot.name)}
    {@render inoutSlot(slot)}
  {/each}
</div>

{#snippet inSlot(slotInfo: plinfo.SlotInfo)}
  {@const slotState = nodeOps.reactiveSlotState(slotInfo.name)}
  <NodeSlot {slotInfo} {slotState} {onDataEntry} {onDataLookup} />
{/snippet}

{#snippet outSlot(slotInfo: plinfo.SlotInfo)}
  {@const slotState = nodeOps.reactiveSlotState(slotInfo.name)}
  <NodeSlot {slotInfo} {slotState} {onDataEntry} {onDataLookup} />
{/snippet}

{#snippet inoutSlot(slotInfo: plinfo.SlotInfo)}
  {@const slotState = nodeOps.reactiveSlotState(slotInfo.name)}
  <NodeSlot
    {slotInfo}
    {slotState}
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
