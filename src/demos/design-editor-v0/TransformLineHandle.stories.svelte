<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import { fn } from "storybook/test";

import TransformLineHandle from "./TransformLineHandle.svelte";

const { Story } = defineMeta({
  title: "Demos/DesignEditorV0/TransformLineHandle",
  component: TransformLineHandle,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { onchange: fn() },
});
</script>

<Story name="Default">
  {#snippet template(args)}
    <div style="width: 920px; height: 620px; position: relative; border-radius: 12px; border: 1px solid rgba(95,95,120,.35); background: linear-gradient(180deg, #f5f7ff, #eef2ff); overflow: hidden;">
      <TransformLineHandle {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Long Diagonal"
  args={{
    initialX1: 120,
    initialY1: 480,
    initialX2: 760,
    initialY2: 140,
    strokeColor: "#c2410c",
  }}
>
  {#snippet template(args)}
    <div style="width: 920px; height: 620px; position: relative; border-radius: 12px; border: 1px solid rgba(95,95,120,.35); background: linear-gradient(180deg, #f5f7ff, #eef2ff); overflow: hidden;">
      <TransformLineHandle {...args} />
    </div>
  {/snippet}
</Story>
