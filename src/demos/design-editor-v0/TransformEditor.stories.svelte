<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import { fn } from "storybook/test";

import TransformEditor from "./TransformEditor.svelte";

const { Story } = defineMeta({
  title: "Demos/DesignEditorV0/TransformEditor",
  component: TransformEditor,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    viewport: { width: 920, height: 620 },
    initial: { x: 340, y: 220, width: 240, height: 150, rotationDeg: -10 },
    mode: "frame",
    onchange: fn(),
  },
});
</script>

<Story name="Frame Default">
  {#snippet template(args)}
    <div style="width: 920px; height: 620px; position: relative; border-radius: 12px; border: 1px solid rgba(95,95,120,.35); background: linear-gradient(180deg, #f5f7ff, #eef2ff); overflow: hidden;">
      <TransformEditor {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Frame Locked Aspect"
  args={{
    mode: "frame",
    initial: { x: 460, y: 300, width: 300, height: 160, rotationDeg: 0 },
    lockAspectRatio: true,
  }}
>
  {#snippet template(args)}
    <div style="width: 920px; height: 620px; position: relative; border-radius: 12px; border: 1px solid rgba(95,95,120,.35); background: linear-gradient(180deg, #f5f7ff, #eef2ff); overflow: hidden;">
      <TransformEditor {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Frame Flip Skew Disabled"
  args={{
    mode: "frame",
    initial: { x: 460, y: 300, width: 300, height: 160, rotationDeg: 0 },
    disableFlip: true,
    disableSkew: true,
  }}
>
  {#snippet template(args)}
    <div style="width: 920px; height: 620px; position: relative; border-radius: 12px; border: 1px solid rgba(95,95,120,.35); background: linear-gradient(180deg, #f5f7ff, #eef2ff); overflow: hidden;">
      <TransformEditor {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Line Default"
  args={{
    mode: "line",
    initial: { x: 220, y: 190, width: 260, height: 0, rotationDeg: 18 },
  }}
>
  {#snippet template(args)}
    <div style="width: 920px; height: 620px; position: relative; border-radius: 12px; border: 1px solid rgba(95,95,120,.35); background: linear-gradient(180deg, #f5f7ff, #eef2ff); overflow: hidden;">
      <TransformEditor {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Line Start On Right"
  args={{
    mode: "line",
    initial: { x: 740, y: 260, width: 280, height: 0, rotationDeg: 180 },
    strokeColor: "#c2410c",
  }}
>
  {#snippet template(args)}
    <div style="width: 920px; height: 620px; position: relative; border-radius: 12px; border: 1px solid rgba(95,95,120,.35); background: linear-gradient(180deg, #f5f7ff, #eef2ff); overflow: hidden;">
      <TransformEditor {...args} />
    </div>
  {/snippet}
</Story>
