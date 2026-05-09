<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import { fn as testFn } from "storybook/test";

import IoCard from "./IoCard.svelte";

const { Story } = defineMeta({
  title: "features/func-gallery/IoCard",
  component: IoCard,
  tags: ["autodocs"],
  args: {
    dtype: "floats",
    label: "floats",
    desc: "Continuous scalar values for amplitudes, thresholds, and animation controls that flow across many graph nodes.",
    selected: false,
    onSelect: testFn(),
  },
});
</script>

<Story name="Default" />

<Story
  name="Selected"
  args={{
    dtype: "bitmap",
    label: "bitmap",
    desc: "Raster image data for previews, texture pipelines, and rendering stages where pixel-level mutation is required.",
    selected: true,
  }}
/>

<Story
  name="Long Description"
  args={{
    dtype: "colors",
    label: "colors",
    desc: "Packed color vectors for gradients, palettes, and procedural look development workflows that need consistent color-space aware transformations across multiple operations.",
  }}
/>

<Story name="Two Column Grid">
  {#snippet template(args)}
    <div style="display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; max-width: 680px;">
      <IoCard
        dtype="floats"
        label="floats"
        desc="Continuous scalar values for amplitudes, thresholds, and animation controls that flow across many graph nodes."
        onSelect={args.onSelect}
      />
      <IoCard
        dtype="points2d"
        label="points2d"
        desc="Two-dimensional coordinate buffers useful for point clouds, path generation, and positional sampling operations."
        onSelect={args.onSelect}
      />
      <IoCard
        dtype="bitmap"
        label="bitmap"
        desc="Raster image data for previews, texture pipelines, and rendering stages where pixel-level mutation is required."
        onSelect={args.onSelect}
      />
      <IoCard
        dtype="colors"
        label="colors"
        desc="Packed color vectors for gradients, palettes, and procedural look development workflows that need consistent color transforms."
        onSelect={args.onSelect}
      />
    </div>
  {/snippet}
</Story>
