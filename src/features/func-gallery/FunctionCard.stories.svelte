<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import { fn as testFn } from "storybook/test";

import type { fn } from "@/types/function";

import FunctionCard from "./FunctionCard.svelte";

const defaultSpec: fn.FunctionInfo = {
  uri: "/demo/perlin",
  label: "Perlin Noise",
  desc: "Returns smooth noise values over a 2D coordinate field.",
  params: [
    { name: "uv", dtype: "points2d", access: "I" },
    { name: "scale", dtype: "floats", access: "I" },
    { name: "out", dtype: "bitmap", access: "O" },
  ],
};

const longCopySpec: fn.FunctionInfo = {
  uri: "/demo/very-long-function-name",
  label: "Extremely Long Function Name That Should Wrap Across Multiple Lines Cleanly",
  desc: "Builds a layered procedural texture from several intermediate fields and then remaps the output through a color transform with intentionally overlong copy to verify three-line truncation.",
  params: [
    { name: "points", dtype: "points2d", access: "I" },
    { name: "seed", dtype: "floats", access: "I" },
    { name: "preview", dtype: "bitmap", access: "O" },
  ],
};

const denseParamsSpec: fn.FunctionInfo = {
  uri: "/demo/dense-params",
  label: "Vector Blend",
  desc: "Dense parameter list used to verify chip overflow and ellipsis rendering.",
  params: [
    { name: "source", dtype: "bitmap", access: "I" },
    { name: "mask", dtype: "bitmap", access: "I" },
    { name: "uv", dtype: "points2d", access: "I" },
    { name: "scale", dtype: "floats", access: "I" },
    { name: "bias", dtype: "floats", access: "I" },
    { name: "gain", dtype: "floats", access: "I" },
    { name: "mix", dtype: "floats", access: "M" },
    { name: "result", dtype: "bitmap", access: "O" },
  ],
};

const gallerySpecs: fn.FunctionInfo[] = [
  defaultSpec,
  {
    uri: "/demo/grid-2d",
    label: "Grid 2D",
    desc: "Generates a regular grid of points inside a rectangular region.",
    params: [
      { name: "bounds", dtype: "points2d", access: "I" },
      { name: "cols", dtype: "floats", access: "I" },
      { name: "rows", dtype: "floats", access: "I" },
      { name: "points", dtype: "points2d", access: "O" },
    ],
  },
  denseParamsSpec,
  {
    uri: "/demo/threshold",
    label: "Threshold",
    desc: "Mutates an incoming scalar list in place based on a threshold edge.",
    params: [
      { name: "val", dtype: "floats", access: "M" },
      { name: "edge", dtype: "floats", access: "I" },
    ],
  },
];

const { Story } = defineMeta({
  title: "features/func-gallery/FunctionCard",
  component: FunctionCard,
  tags: ["autodocs"],
  args: {
    spec: defaultSpec,
    selected: false,
    onSelect: testFn(),
  },
});
</script>

<Story name="Default" />

<Story
  name="Selected"
  args={{
    spec: defaultSpec,
    selected: true,
  }}
/>

<Story
  name="Long Copy"
  args={{
    spec: longCopySpec,
  }}
/>

<Story
  name="Dense Params"
  args={{
    spec: denseParamsSpec,
  }}
/>

<Story name="Gallery Grid">
  {#snippet template(args)}
    <div
      style="display: grid; grid-template-columns: repeat(auto-fit, 240px); gap: 16px; max-width: 760px;"
    >
      {#each gallerySpecs as spec, index (spec.uri)}
        <FunctionCard
          spec={spec}
          selected={index === 1}
          onSelect={args.onSelect}
        />
      {/each}
    </div>
  {/snippet}
</Story>