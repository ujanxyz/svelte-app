<script lang="ts" module>
import { defineMeta, type StoryContext } from "@storybook/addon-svelte-csf";
import { fn } from "storybook/test";
import { type ComponentProps } from "svelte";

import FixedBoxContainer from "@/storybook/wrappers/FixedBoxContainer.svelte";

import StageViewStages from "./StageViewStages.svelte";
import { type PipelineStage } from "./types";

const stage1: PipelineStage = {
  id: "abcd01",
  label: "Util Function",
  inputs: [
    { name: "m1", type: "matrix4" },
    { name: "m2", type: "matrix4" },
  ],
  outputs: [
    { name: "y1", type: "float2" },
    { name: "c1", type: "color" },
  ],
};

const stage2: PipelineStage = {
  id: "abcd02",
  label: "Math Function",
  inputs: [{ name: "x", type: "float2" }],
  outputs: [{ name: "fx", type: "float" }],
};

const stage3: PipelineStage = {
  id: "abcd03",
  label: "Conversion",
  inputs: [{ name: "x", type: "float" }],
  outputs: [{ name: "fx", type: "float" }],
};

const { Story } = defineMeta({
  title: "PipelineView/StageViewStages",
  component: StageViewStages,
  tags: ["autodocs"],
  args: {
    stages: [stage1, stage2, stage3],
    // onSelect: fn(),
  },
});

type Args = ComponentProps<typeof StageViewStages>;
</script>

<Story name="Default" />

<Story name="Contained" args={{}}>
  {#snippet template({ ...args }: Args)}
    <FixedBoxContainer width={300} height={120}>
      <StageViewStages {...args} />
    </FixedBoxContainer>
  {/snippet}
</Story>

<Story name="Portrait" args={{}}>
  {#snippet template({ ...args }: Args)}
    <FixedBoxContainer width={400} height={600}>
      <StageViewStages {...args} />
    </FixedBoxContainer>
  {/snippet}
</Story>
