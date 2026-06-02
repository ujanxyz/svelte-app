<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import { fn } from "storybook/test";

import ElementActionBar from "./ElementActionBar.svelte";

const { Story } = defineMeta({
  title: "Demos/DesignEditorV0/ElementActionBar",
  component: ElementActionBar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    coordinate: { left: 260, top: 120 },
    onaction: fn(),
  },
});
</script>

<Story name="Default">
  {#snippet template(args)}
    <div style="width: 520px; height: 320px; position: relative; border-radius: 12px; border: 1px solid rgba(95,95,120,.35); background: linear-gradient(180deg, #f8faff, #eef2ff); overflow: hidden;">
      <ElementActionBar {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Near Top Edge"
  args={{
    coordinate: { left: 260, top: 24 },
  }}
>
  {#snippet template(args)}
    <div style="width: 520px; height: 320px; position: relative; border-radius: 12px; border: 1px solid rgba(95,95,120,.35); background: linear-gradient(180deg, #f8faff, #eef2ff); overflow: hidden;">
      <ElementActionBar {...args} />
    </div>
  {/snippet}
</Story>
