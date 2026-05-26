<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import { fn } from "storybook/test";

import TransformFrame from "./TransformFrame.svelte";

const { Story } = defineMeta({
  title: "Demos/DesignEditorV0/TransformFrame",
  component: TransformFrame,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Use TransformFrame inside a full-sized div layer so the SVG root can size itself to the available drawing area. Pass initial as a rect object with x, y, width, height, and rotationDeg.",
      },
    },
  },
  args: {
    initial: { x: 220, y: 145, width: 240, height: 150, rotationDeg: -10 },
    viewport: { width: 920, height: 620 },
    onchange: fn(),
  },
});
</script>

<Story name="Default">
  {#snippet template(args)}
    <div style="width: 920px; height: 620px; position: relative; border-radius: 12px; border: 1px solid rgba(95,95,120,.35); background: linear-gradient(180deg, #f5f7ff, #eef2ff); overflow: hidden;">
      <TransformFrame {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Large Rotated"
  args={{
    initial: { x: 280, y: 230, width: 360, height: 180, rotationDeg: 22 },
  }}
>
  {#snippet template(args)}
    <div style="width: 920px; height: 620px; position: relative; border-radius: 12px; border: 1px solid rgba(95,95,120,.35); background: linear-gradient(180deg, #f5f7ff, #eef2ff); overflow: hidden;">
      <TransformFrame {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Flip and Shear Handles"
  args={{
    initial: { x: 310, y: 220, width: 300, height: 160, rotationDeg: 0 },
    strokeColor: "#7c3aed",
  }}
>
  {#snippet template(args)}
    <div style="width: 920px; height: 620px; position: relative; border-radius: 12px; border: 1px solid rgba(95,95,120,.35); background: linear-gradient(180deg, #f5f7ff, #eef2ff); overflow: hidden;">
      <TransformFrame {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Locked Aspect Ratio"
  args={{
    initial: { x: 310, y: 220, width: 300, height: 160, rotationDeg: 0 },
    lockAspectRatio: true,
  }}
>
  {#snippet template(args)}
    <div style="width: 920px; height: 620px; position: relative; border-radius: 12px; border: 1px solid rgba(95,95,120,.35); background: linear-gradient(180deg, #f5f7ff, #eef2ff); overflow: hidden;">
      <TransformFrame {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Flip and Skew Disabled"
  args={{
    initial: { x: 310, y: 220, width: 300, height: 160, rotationDeg: 0 },
    disableFlip: true,
    disableSkew: true,
  }}
>
  {#snippet template(args)}
    <div style="width: 920px; height: 620px; position: relative; border-radius: 12px; border: 1px solid rgba(95,95,120,.35); background: linear-gradient(180deg, #f5f7ff, #eef2ff); overflow: hidden;">
      <TransformFrame {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="All Disabled"
  args={{
    initial: { x: 310, y: 220, width: 300, height: 160, rotationDeg: 0 },
    lockAspectRatio: true,
    disableFlip: true,
    disableSkew: true,
  }}
>
  {#snippet template(args)}
    <div style="width: 920px; height: 620px; position: relative; border-radius: 12px; border: 1px solid rgba(95,95,120,.35); background: linear-gradient(180deg, #f5f7ff, #eef2ff); overflow: hidden;">
      <TransformFrame {...args} />
    </div>
  {/snippet}
</Story>
