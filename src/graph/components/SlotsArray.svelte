<script lang="ts">
import FuncParamSlot from "@/graph/components/FuncParamSlot.svelte";
import type { grph } from "@/types/grph";

import MyHandle from "./MyHandle.svelte";

interface Props {
  ins: grph.SlotInfo[];
  outs: grph.SlotInfo[];
  inouts: grph.SlotInfo[];
  reactiveSlot(slotName: string): grph.SlotState;
}

const { ins, outs, inouts, reactiveSlot }: Props = $props();

</script>

<div class="flex-fitted-rows">
  {#each [...ins, ...outs, ...inouts] as slot (slot.name)}
    {@render renderSlot(slot)}
  {/each}
</div>

{#snippet renderSlot(slotInfo: grph.SlotInfo)}
  {@const slotState = reactiveSlot(slotInfo.name)}
  <div class="slotrow">
    <FuncParamSlot {slotInfo} {slotState} />

    {#if slotInfo.access === "I"}
    {@const handleId = slotInfo.name + "/in"}
      <MyHandle kind="in" id={handleId} />
      <MyHandle kind="out-x" />
    {:else if slotInfo.access === "O"}
      {@const handleId = slotInfo.name + "/out"}
      <MyHandle kind="in-x" />
      <MyHandle kind="out" id={handleId} />
    {:else}
      {@const [handleIdIn, handleIdOut] = [
        `${slotInfo.name}/in`,
        `${slotInfo.name}/out`,
      ]}
      <MyHandle kind="in" id={handleIdIn} />
      <MyHandle kind="out" id={handleIdOut} />
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
