<script lang="ts" module>
import { defineMeta, type StoryContext } from "@storybook/addon-svelte-csf";
import { fn } from "storybook/test";
import { type ComponentProps } from "svelte";

import FixedBoxContainer from "@/storybook/wrappers/FixedBoxContainer.svelte";

import StageListRow from "./StageListRow.svelte";
import { type PipelineStage } from "./types";

const stage: PipelineStage = {
  id: "abcd01",
  label: "Dummy stage",
  inputs: [
    { name: "x1", type: "float2" },
    { name: "x2", type: "float2" },
  ],
  outputs: [
    { name: "y1", type: "float2" },
    { name: "c1", type: "color" },
  ],
};

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const { Story } = defineMeta({
  title: "PipelineView/StageListRow",
  component: StageListRow,
  tags: ["autodocs"],
  args: {
    stage,
    onSelect: fn(),
  },
});

type Args = Omit<ComponentProps<typeof StageListRow>, "width" | "height"> & {
  width?: number;
  height?: number;
};
</script>

{#snippet template1({ width, ...args }: Args, context: StoryContext<Args>)}
  <FixedBoxContainer {width} height={width}>
    <StageListRow {...args} />
  </FixedBoxContainer>
{/snippet}

<Story name="Default" />

<Story name="Selected" args={{ selected: true }} />

<Story name="Upstream" args={{ upstream: true }} />

<Story name="Downstream" args={{ downstream: true }} />

<Story name="Boxed">
  {#snippet template()}
    <FixedBoxContainer width={300} height={200}>
      <StageListRow {stage} />
    </FixedBoxContainer>
  {/snippet}
</Story>

<Story name="Templated" args={{ upstream: true }} template={template1} />

<Story name="In List" args={{}}>
  {#snippet template()}
    <FixedBoxContainer width={200} height={300}>
      <StageListRow {stage} />
      <StageListRow {stage} />
      <StageListRow {stage} />
    </FixedBoxContainer>
  {/snippet}
</Story>
