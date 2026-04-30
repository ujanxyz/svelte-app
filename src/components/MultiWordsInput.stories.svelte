<script module>
import { defineMeta } from "@storybook/addon-svelte-csf";

import MultiWordsInput from "./MultiWordsInput.svelte";

const { Story } = defineMeta({
  title: "Components/MultiWordsInput",
  component: MultiWordsInput,
  tags: ["autodocs"],
});
</script>

<script lang="ts">
const entries = new Map([
  ["foo", "alpha"],
  ["bar", "beta"],
  ["baz", "gamma"],
]);
</script>

<Story name="Default">
  {#snippet template()}
    <MultiWordsInput entries={entries} />
  {/snippet}
</Story>
