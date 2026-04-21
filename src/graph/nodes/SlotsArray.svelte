<script lang="ts">
import type { plinfo } from "@/types/plinfo";

import { type GraphServiceType } from "../graph-services";
import type { UjOverrideData } from "../types";
import NodeSlot from "./NodeSlot.svelte";

interface Props {
  nodeId: string;
  rawNodeId: number;
  ins: plinfo.SlotInfo[];
  outs: plinfo.SlotInfo[];
  inouts: plinfo.SlotInfo[];
  slotService: GraphServiceType<"slotService">;
}

const { nodeId, rawNodeId, ins, outs, inouts, slotService }: Props = $props();

function onDataEntry(slotName: string, data: UjOverrideData): void {
  console.log(slotName, data);
  slotService.setOverride(nodeId, slotName, true, data);
}

function onDataLookup(slotName: string): UjOverrideData | null {
  return slotService.lookupOverride(nodeId, slotName);
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
  {@const slotState = slotService.useSlotState({parent: rawNodeId, name: slotInfo.name})}
  <NodeSlot {slotInfo} {slotState} {onDataEntry} {onDataLookup} />
{/snippet}

{#snippet outSlot(slotInfo: plinfo.SlotInfo)}
  {@const slotState = slotService.useSlotState({parent: rawNodeId, name: slotInfo.name})}
  <NodeSlot {slotInfo} {slotState} {onDataEntry} {onDataLookup} />
{/snippet}

{#snippet inoutSlot(slotInfo: plinfo.SlotInfo)}
  {@const slotState = slotService.useSlotState({parent: rawNodeId, name: slotInfo.name})}
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
