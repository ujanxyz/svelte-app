<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";

import NodeHeader from "./NodeHeader.svelte";

const { Story } = defineMeta({
  title: "graph/components/NodeHeader",
  component: NodeHeader,
  tags: ["autodocs"],
  args: {
    rawNodeId: 42,
    label: "Blur Filter",
    nodeId: "node_xy_0042",
  },
});
</script>

<Story name="Default">
  {#snippet template(args)}
    <div style="width: 200px; padding: 4px; background: var(--color-bg-1); border: 1px solid var(--color-border-subtle); border-radius: 8px;">
      <NodeHeader {...args} />
    </div>
  {/snippet}
</Story>

<Story name="Long Label">
  {#snippet template(args)}
    <div style="width: 200px; padding: 4px; background: var(--color-bg-1); border: 1px solid var(--color-border-subtle); border-radius: 8px;">
      <NodeHeader rawNodeId={7} label="Voronoi Displacement Map Generator" nodeId="node_xy_0007" />
    </div>
  {/snippet}
</Story>

<Story name="Multiple Nodes">
  {#snippet template(args)}
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="width: 200px; padding: 4px; background: var(--color-bg-1); border: 1px solid var(--color-border-subtle); border-radius: 8px;">
        <NodeHeader rawNodeId={1} label="Input Source" nodeId="node_xy_0001" />
      </div>
      <div style="width: 200px; padding: 4px; background: var(--color-bg-1); border: 1px solid var(--color-border-subtle); border-radius: 8px;">
        <NodeHeader rawNodeId={2} label="Color Grader" nodeId="node_xy_0002" />
      </div>
      <div style="width: 200px; padding: 4px; background: var(--color-bg-1); border: 1px solid var(--color-border-subtle); border-radius: 8px;">
        <NodeHeader rawNodeId={3} label="Output Sink" nodeId="node_xy_0003" />
      </div>
    </div>
  {/snippet}
</Story>
