<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";

import ShapeHighlighterV2 from "./ShapeHighlighterV2.svelte";

const { Story } = defineMeta({
  title: "Demos/DesignEditorV0/ShapeHighlighterV2",
  component: ShapeHighlighterV2,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
});
</script>

<Story
  name="Default"
  args={{
    rect: { x: 120, y: 70, width: 190, height: 120, rotationDeg: 0 },
  }}
>
  {#snippet template(args)}
    <div style="width: 520px; height: 320px; position: relative; border-radius: 12px; border: 1px solid rgba(95,95,120,.35); background: linear-gradient(180deg, #f8faff, #eef2ff); overflow: hidden;">
      <svg width="100%" height="100%" viewBox="0 0 520 320">
        <ShapeHighlighterV2 {...args} />
      </svg>
    </div>
  {/snippet}
</Story>

<Story
  name="Rotated"
  args={{
    rect: { x: 180, y: 90, width: 170, height: 90, rotationDeg: 28 },
    dashed: true,
  }}
>
  {#snippet template(args)}
    <div style="width: 520px; height: 320px; position: relative; border-radius: 12px; border: 1px solid rgba(95,95,120,.35); background: linear-gradient(180deg, #f8faff, #eef2ff); overflow: hidden;">
      <svg width="100%" height="100%" viewBox="0 0 520 320">
        <ShapeHighlighterV2 {...args} />
      </svg>
    </div>
  {/snippet}
</Story>
