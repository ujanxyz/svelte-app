<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import { fn } from "storybook/test";

import TextIconPill from "./TextIconPill.svelte";

const { Story } = defineMeta({
  title: "Components/TextIconPill",
  component: TextIconPill,
  tags: ["autodocs"],
  args: {
    text: "/noise",
  },
});
</script>

<Story name="Static Text" />

<Story
  name="Clickable With Icon"
  args={{
    text: "/sampling",
    icon: "x",
    onClick: fn(),
  }}
/>

<Story name="Long Text Truncation">
  {#snippet template(args)}
    <TextIconPill
      {...args}
      text="/extremely-long-category-name-for-visual-truncation"
      icon="x-circle"
      onClick={fn()}
    />
  {/snippet}
</Story>
