<script lang="ts">
import type { plinfo } from "@/types/plinfo";

import { getNodeContextOps } from "./nodeContextOps";
import NodeSlot from "./NodeSlot.svelte";

interface Props {
  ins: plinfo.SlotInfo[];
  outs: plinfo.SlotInfo[];
  inouts: plinfo.SlotInfo[];
}

const { ins, outs, inouts }: Props = $props();

const nodeOps = getNodeContextOps();

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
  <NodeSlot {slotInfo} {slotState} />
{/snippet}

{#snippet outSlot(slotInfo: plinfo.SlotInfo)}
  {@const slotState = nodeOps.reactiveSlotState(slotInfo.name)}
  <NodeSlot {slotInfo} {slotState} />
{/snippet}

{#snippet inoutSlot(slotInfo: plinfo.SlotInfo)}
  {@const slotState = nodeOps.reactiveSlotState(slotInfo.name)}
  <NodeSlot {slotInfo} {slotState} />
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
