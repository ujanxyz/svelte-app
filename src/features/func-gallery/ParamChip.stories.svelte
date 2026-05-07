<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";

import ParamChip from "./ParamChip.svelte";

const { Story } = defineMeta({
  title: "features/func-gallery/ParamChip",
  component: ParamChip,
  tags: ["autodocs"],
  args: {
    name: "points",
    dtype: "floats",
    access: "O",
  },
});

const chipExamples = [
  { name: "bounds", dtype: "floats", access: "I" as const },
  { name: "count", dtype: "bitmap", access: "M" as const },
  { name: "points", dtype: "floats", access: "O" as const },
  { name: "mode", dtype: "string", access: "I" as const },
];
</script>

<Story name="Default" />

<Story name="Mixed Strip">
  {#snippet template()}
    <div style="padding: 16px; width: fit-content;">
      {#each chipExamples as chip}
        <ParamChip {...chip} />
      {/each}
    </div>
  {/snippet}
</Story>

<Story name="Wrap Layout">
  {#snippet template()}
    <div style="padding: 16px; width: 280px;">
      {#each [...chipExamples, ...chipExamples, ...chipExamples] as chip, index (`${chip.name}-${index}`)}
        <ParamChip {...chip} />
      {/each}
    </div>
  {/snippet}
</Story>