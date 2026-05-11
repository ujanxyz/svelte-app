<script lang="ts">
import FuncParamSlot from "@/graph/components/FuncParamSlot.svelte";
import type { grph } from "@/types/grph";

import MyHandle from "./MyHandle.svelte";
import { getNodeContextOps } from "./nodeContextOps";

interface Props {
  ins: grph.SlotInfo[];
  outs: grph.SlotInfo[];
  inouts: grph.SlotInfo[];
}

const { ins, outs, inouts }: Props = $props();

const nodeOps = getNodeContextOps();

</script>

<div class="flex-fitted-rows">
  {#each [...ins, ...outs, ...inouts] as slot (slot.name)}
    {@render renderSlot(slot)}
  {/each}
</div>

{#snippet renderSlot(slotInfo: grph.SlotInfo)}
  {@const slotState = nodeOps.reactiveSlotState(slotInfo.name)}
  <div class="slotrow">
    <FuncParamSlot {slotInfo} {slotState} />

    {#if slotInfo.access === "I"}
      <MyHandle kind="in" id={slotInfo.name} />
      <MyHandle kind="out-x" />
    {:else if slotInfo.access === "O"}
      <MyHandle kind="in-x" />
      <MyHandle kind="out" id={slotInfo.name} />
    {:else}
      {@const [handleNameIn, handleNameOut] = [
        `${slotInfo.name}/in`,
        `${slotInfo.name}/out`,
      ]}
      <MyHandle kind="in" id={handleNameIn} />
      <MyHandle kind="out" id={handleNameOut} />
    {/if}
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

.slotrow {
  position: relative;
  padding-left: var(--space-3);
  padding-right: var(--space-3);
}
</style>
