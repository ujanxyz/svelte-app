<script lang="ts">
// Icons.
import BracketsSquareIcon from "phosphor-svelte/lib/BracketsSquareIcon";
import DotOutlineIcon from "phosphor-svelte/lib/DotOutlineIcon";
import LinkSimpleBreakIcon from "phosphor-svelte/lib/LinkSimpleBreakIcon";
import LinkSimpleIcon from "phosphor-svelte/lib/LinkSimpleIcon";
import SquareLogoIcon from "phosphor-svelte/lib/SquareLogoIcon";

import DataPicker from "@/modules/sloteditor/DataPicker.svelte";
import { ReturnStatus } from "@/overlay/constants";
import { useOverlayUi } from "@/overlay/overlayStore";
import type { plinfo } from "@/types/plinfo";

import type { UjOverrideData, UjSlotInfo } from "../types";
import MyHandle from "./MyHandle.svelte";

// Derive the param types without explicitly importing.
type SlotState = UjSlotInfo["state"];

interface Props {
  slotInfo: plinfo.SlotInfo;
  /**
   * slotInfoIn is used in "in" and "inout" slots. This is reactive optional (SvelteMap value)
   */
  slotInfoIn?: UjSlotInfo;
  /**
   * slotInfoOut is used in "out" and "inout" slots. This is reactive optional (SvelteMap value)
   */
  slotInfoOut?: UjSlotInfo;
  /**
   * Invoked when use manually enters data and applies.
   * @param slotName The name of this slot.
   * @param data The entered data.
   */
  onDataEntry?: (slotName: string, data: UjOverrideData) => void;

  /**
   * Used in "in" and "inout" slots
   * @param slotName The name of this slot.
   */
  onDataLookup?: (slotName: string) => UjOverrideData | null;
}

const {
  slotInfo: slot,
  slotInfoIn,
  slotInfoOut,
  onDataEntry,
  onDataLookup,
}: Props = $props();

const inState: SlotState = $derived(slotInfoIn?.state ?? "blank");
const outState: SlotState = $derived(slotInfoOut?.state ?? "blank");

const editorPopup = useOverlayUi(miniEditor);

// TODO: Re-visit this logic later, there are several corner cases.
async function onClickPane(ev: MouseEvent): Promise<void> {
  ev.preventDefault();
  if (!onDataEntry) {
    return;
  }
  if (slot.access === "O") {
    window.alert("On click out param not implemented");
    return;
  }
  if (slotInfoIn?.state === "edge") {
    window.alert(
      "Cannot enter data. Delete the connection(s) at the input slot and try again.",
    );
    return;
  }
  const slotName = (slot.access === "I") ? slot.name : slot.name + "/in";
  const prior = onDataLookup?.(slotName) ?? null;

  const anchor = ev.currentTarget as HTMLButtonElement;
  const datatype = "float2";
  const editedData = await editorPopup.openOverlayAsync<UjOverrideData>({
    anchor,
    datatype,
    prior,
  });
  if (editedData.status !== ReturnStatus.OK) return;
  console.log(slot.access, "slotName -> ", slotName, slotInfoIn);
  onDataEntry(slotName, editedData.value!);
}
</script>

<div class="slotrow rounded-sm flex-centered-cells">
  {#if slot.access === "I"}
    <button
      class="panebtn flex-centered-cells rounded-sm"
      onclick={onClickPane}
      data-debug-name="slot-pane-btn"
    >
      <div class="grow">
        {slot.name}
      </div>
      {@render stateIcon(inState, false)}
      {@render blankIcon()}
    </button>
  {:else if slot.access === "O"}
    <button
      class="panebtn flex-centered-cells rounded-sm"
      disabled={true}
      data-debug-name="slot-pane-btn"
    >
      <div class="grow">
        {slot.name}
      </div>
      {@render blankIcon()}
      {@render stateIcon(outState, true)}
    </button>
  {:else}
    <button
      class="panebtn flex-centered-cells rounded-sm"
      onclick={onClickPane}
      data-debug-name="slot-pane-btn"
    >
      <div class="grow">
        {slot.name}
      </div>
      {@render stateIcon(inState, false)}
      {@render stateIcon(outState, true)}
    </button>
  {/if}

  {#if slot.access === "I"}
    <MyHandle kind="in" id={slot.name} />
    <MyHandle kind="out-x" />
  {:else if slot.access === "O"}
    <MyHandle kind="in-x" />
    <MyHandle kind="out" id={slot.name} />
  {:else}
    {@const [paramNameIn, paramNameOut] = [
      `${slot.name}/in`,
      `${slot.name}/out`,
    ]}
    <MyHandle kind="in" id={paramNameIn} />
    <MyHandle kind="out" id={paramNameOut} />
  {/if}
</div>

{#snippet stateIcon(slotState: SlotState, isOutSlot: boolean)}
  {#if slotState === "blank"}
    {#if isOutSlot}
      <LinkSimpleBreakIcon size={8} />
    {:else}
      <BracketsSquareIcon size={8} />
    {/if}
  {:else if slotState === "edge"}
    <LinkSimpleIcon size={8} />
  {:else if slotState === "data"}
    <SquareLogoIcon size={8} />
  {/if}
{/snippet}

{#snippet blankIcon()}
  <DotOutlineIcon size={8} />
{/snippet}

{#snippet miniEditor()}
  <DataPicker />
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
