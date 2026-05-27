<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import { fn } from "storybook/test";

import TransformLineV2 from "./TransformLineV2.svelte";

const { Story } = defineMeta({
  title: "Demos/DesignEditorV0/TransformLineV2",
  component: TransformLineV2,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Line transform widget modeled as RotatedRect: x/y is line start, width is length, height remains 0, and rotationDeg defines slope.",
      },
    },
  },
  args: {
    viewport: { width: 920, height: 620 },
    initial: { x: 220, y: 190, width: 260, height: 0, rotationDeg: 18 },
    onchange: fn(),
  },
});
</script>

<Story name="Default">
  {#snippet template(args)}
    <div style="width: 920px; height: 620px; position: relative; border-radius: 12px; border: 1px solid rgba(95,95,120,.35); background: linear-gradient(180deg, #f5f7ff, #eef2ff); overflow: hidden;">
      <TransformLineV2 {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="StartOnRight"
  args={{
    initial: { x: 740, y: 260, width: 280, height: 0, rotationDeg: 180 },
    strokeColor: "#c2410c",
  }}
>
  {#snippet template(args)}
    <div style="width: 920px; height: 620px; position: relative; border-radius: 12px; border: 1px solid rgba(95,95,120,.35); background: linear-gradient(180deg, #f5f7ff, #eef2ff); overflow: hidden;">
      <TransformLineV2 {...args} />
    </div>
  {/snippet}
</Story>
