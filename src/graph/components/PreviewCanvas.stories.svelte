<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import { fn as testFn } from "storybook/test";

import type { plinfo } from "@/types/plinfo";

import PreviewCanvas from "./PreviewCanvas.svelte";

const bitmapSlotInfo: plinfo.SlotInfo = {
  parent: 1,
  name: "preview",
  dtype: "bitmap",
  access: "O",
};

const floatSlotInfo: plinfo.SlotInfo = {
  parent: 1,
  name: "scalar",
  dtype: "floats",
  access: "I",
};

const mockNodeOps = {
  registerPreview: async () => "mock-preview-key",
  unregisterPreview: async () => {},
};

const { Story } = defineMeta({
  title: "graph/components/PreviewCanvas",
  component: PreviewCanvas,
  tags: ["autodocs"],
  args: {
    slotInfo: bitmapSlotInfo,
    nodeOps: mockNodeOps,
    onclick: testFn(),
  },
});
</script>

<Story name="Bitmap Preview">
  {#snippet template(args)}
    <div style="padding: 1rem; background: var(--color-bg-2); border-radius: 8px; display: inline-flex;">
      <PreviewCanvas {...args} slotInfo={bitmapSlotInfo} />
    </div>
  {/snippet}
</Story>

<Story name="Non Bitmap Slot">
  {#snippet template(args)}
    <div style="padding: 1rem; background: var(--color-bg-2); border-radius: 8px; display: inline-flex;">
      <PreviewCanvas {...args} slotInfo={floatSlotInfo} />
    </div>
  {/snippet}
</Story>

<Story name="Inline In Layout">
  {#snippet template(args)}
    <div style="display: flex; gap: 12px; padding: 1rem; background: var(--color-bg-2); border-radius: 8px; align-items: center;">
      <PreviewCanvas {...args} slotInfo={bitmapSlotInfo} />
      <div style="font-size: 0.8rem; color: var(--color-text-md-con); max-width: 12rem;">
        Square preview surface sized for compact graph nodes, with hover outline and click-through handled by the parent node.
      </div>
    </div>
  {/snippet}
</Story>