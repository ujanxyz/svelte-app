<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import { fn } from "storybook/test";

import SearchInputBox from "./SearchInputBox.svelte";

const { Story } = defineMeta({
  title: "Components/SearchInputBox",
  component: SearchInputBox,
  tags: ["autodocs"],
  args: {
    placeholder: "Search function",
    onUpdateText: fn(),
  },
});
</script>

<Story name="Default" />

<Story
  name="Long Placeholder"
  args={{
    placeholder: "Search function, graph input, or graph output",
  }}
/>

<Story name="Fixed Width Container">
  {#snippet template(args)}
    <div style="width: 320px; padding: 16px;">
      <SearchInputBox {...args} class="search-story" />
    </div>
  {/snippet}
</Story>