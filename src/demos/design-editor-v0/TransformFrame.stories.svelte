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
  },
  args: {
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
    initialCenterX: 460,
    initialCenterY: 320,
    initialWidth: 360,
    initialHeight: 180,
    initialRotationDeg: 22,
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
    initialCenterX: 460,
    initialCenterY: 300,
    initialWidth: 300,
    initialHeight: 160,
    initialRotationDeg: 0,
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
    initialCenterX: 460,
    initialCenterY: 300,
    initialWidth: 300,
    initialHeight: 160,
    initialRotationDeg: 0,
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
    initialCenterX: 460,
    initialCenterY: 300,
    initialWidth: 300,
    initialHeight: 160,
    initialRotationDeg: 0,
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
    initialCenterX: 460,
    initialCenterY: 300,
    initialWidth: 300,
    initialHeight: 160,
    initialRotationDeg: 0,
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
