<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";

import CrossViewDragDrop from "./CrossViewDragDrop.svelte";

const { Story } = defineMeta({
  title: "Demos/Switcher/CrossViewDragDrop",
  component: CrossViewDragDrop,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    initialView: "A",
    switchDelayMs: 1000,
  },
});
</script>

<Story name="Default Portal Delay" />

<Story
  name="Starts In View B"
  args={{
    initialView: "B",
  }}
/>

<Story
  name="Fast Portal Switch"
  args={{
    switchDelayMs: 350,
  }}
/>
