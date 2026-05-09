<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";

import type { plinfo } from "@/types/plinfo";
import type { plstate } from "@/types/plstate";

import FuncParamSlot from "./FuncParamSlot.svelte";

const slotInfoInput: plinfo.SlotInfo = {
  parent: 101,
  name: "seedValue",
  dtype: "floats",
  access: "I",
};

const slotInfoOutput: plinfo.SlotInfo = {
  parent: 101,
  name: "preview",
  dtype: "bitmap",
  access: "O",
};

const slotInfoInOut: plinfo.SlotInfo = {
  parent: 101,
  name: "points",
  dtype: "points2d",
  access: "M",
};

const slotStateEmpty: plstate.SlotState = {
  inEdges: [],
  outEdges: [],
  encodedData: null,
  genId: 1,
};

const slotStateConnectedIn: plstate.SlotState = {
  inEdges: [11],
  outEdges: [],
  encodedData: null,
  genId: 2,
};

const slotStateConnectedBoth: plstate.SlotState = {
  inEdges: [22],
  outEdges: [31, 32],
  encodedData: null,
  genId: 3,
};

const { Story } = defineMeta({
  title: "graph/components/FuncParamSlot",
  component: FuncParamSlot,
  tags: ["autodocs"],
  args: {
    slotInfo: slotInfoInput,
    slotState: slotStateEmpty,
  },
});
</script>

<Story name="Input Slot Empty">
  {#snippet template(args)}
    <div style="width: 200px; padding: 12px; background: var(--color-bg-1); border: 1px solid var(--color-border-subtle); border-radius: 8px;">
      <FuncParamSlot {...args} slotInfo={slotInfoInput} slotState={slotStateEmpty} />
    </div>
  {/snippet}
</Story>

<Story name="Output Slot Connected">
  {#snippet template(args)}
    <div style="width: 200px; padding: 12px; background: var(--color-bg-1); border: 1px solid var(--color-border-subtle); border-radius: 8px;">
      <FuncParamSlot {...args} slotInfo={slotInfoOutput} slotState={slotStateConnectedBoth} />
    </div>
  {/snippet}
</Story>

<Story name="InOut Mixed Status">
  {#snippet template(args)}
    <div style="display: grid; gap: 8px; width: 200px; padding: 12px; background: var(--color-bg-1); border: 1px solid var(--color-border-subtle); border-radius: 8px;">
      <FuncParamSlot {...args} slotInfo={slotInfoInOut} slotState={slotStateEmpty} />
      <FuncParamSlot {...args} slotInfo={slotInfoInOut} slotState={slotStateConnectedIn} />
      <FuncParamSlot {...args} slotInfo={slotInfoInOut} slotState={slotStateConnectedBoth} />
    </div>
  {/snippet}
</Story>
