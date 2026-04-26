<script lang="ts">
// Icons.
import BracketsSquareIcon from "phosphor-svelte/lib/BracketsSquareIcon";
import DotOutlineIcon from "phosphor-svelte/lib/DotOutlineIcon";
import LinkSimpleBreakIcon from "phosphor-svelte/lib/LinkSimpleBreakIcon";
import LinkSimpleIcon from "phosphor-svelte/lib/LinkSimpleIcon";

import type { plinfo } from "@/types/plinfo";
import type { plstate } from "@/types/plstate";

import MyHandle from "./MyHandle.svelte";
import { getNodeContextOps } from "./nodeContextOps";

interface Props {
  slotInfo: plinfo.SlotInfo;
  slotState: plstate.SlotState;
}

const { slotInfo, slotState }: Props = $props();

const nodeOps = getNodeContextOps();

// TODO: Re-visit this logic later, there are several corner cases.
async function onClickPane(ev: MouseEvent): Promise<void> {
  ev.preventDefault();
  const anchor = ev.currentTarget as HTMLButtonElement;
  const rect = anchor.getBoundingClientRect();
  await nodeOps.onSlotInput(slotInfo, slotState, rect);
}

</script>

<div class="slotrow rounded-sm flex-centered-cells">
  <!-- ${slotDescStr} -->
  {#if slotInfo.access === "I"}
    <button
      class="panebtn flex-centered-cells rounded-sm"
      onclick={onClickPane}
      data-debug-name="slot-pane-btn"
    >
      <div class="grow">
        {slotInfo.name}
      </div>
      {@render statusIcons(slotInfo, slotState)}
    </button>
  {:else if slotInfo.access === "O"}
    <button
      class="panebtn flex-centered-cells rounded-sm"
      disabled={true}
      data-debug-name="slot-pane-btn"
    >
      <div class="grow">
        {slotInfo.name}
      </div>
      {@render statusIcons(slotInfo, slotState)}
    </button>
  {:else}
    <button
      class="panebtn flex-centered-cells rounded-sm"
      onclick={onClickPane}
      data-debug-name="slot-pane-btn"
    >
      <div class="grow">
        {slotInfo.name}
      </div>
      {@render statusIcons(slotInfo, slotState)}
    </button>
  {/if}

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

{#snippet statusIcons(slotInfo: plinfo.SlotInfo, slotState: plstate.SlotState)}
  {#if slotInfo.access === "I"}
    {#if slotState.inEdges.length > 0 }
      <LinkSimpleIcon size={8} />
    {:else}
      <BracketsSquareIcon size={8} />
    {/if}
    {@render blankIcon()}
  {:else if slotInfo.access === "O"}
    {@render blankIcon()}
    {#if slotState.outEdges.length > 0 }
      <LinkSimpleIcon size={8} />
    {:else}
      <LinkSimpleBreakIcon size={8} />
    {/if}
  {:else if slotInfo.access === "M"}
    {#if slotState.inEdges.length > 0 }
      <LinkSimpleIcon size={8} />
    {:else}
      <BracketsSquareIcon size={8} />
    {/if}
    {#if slotState.outEdges.length > 0 }
      <LinkSimpleIcon size={8} />
    {:else}
      <LinkSimpleBreakIcon size={8} />
    {/if}
  {/if}
{/snippet}


{#snippet blankIcon()}
  <DotOutlineIcon size={8} />
{/snippet}

<style>
.slotrow {
  position: relative;
  /* margin-left: var(--space-2);
  margin-right: var(--space-2); */
  /* padding-left: var(--space-3);
  padding-right: var(--space-3); */
}
.panebtn {
  flex-grow: 1;
  background-color: #3a516c;
  color: var(--color-text-hi-con);
  margin-left: calc(var(--space-4) + 4px);
  margin-right: calc(var(--space-4) + 4px);
  padding: var(--space-1) var(--space-2);
  text-align: start;
  font-size: 0.5rem;
  cursor: pointer;
}
.flex-centered-cells {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  /* column-gap: var(--space-2); */
  column-gap: 0;
}
</style>
