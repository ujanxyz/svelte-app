<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import { fn } from "storybook/test";

import DeepEdit from "./DeepEdit.svelte";

const { Story } = defineMeta({
  title: "Demos/DesignEditorV0/DeepEdit",
  component: DeepEdit,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    shapeType: "polygon",
    viewDimension: { width: 1280, height: 960 },
    viewport: { width: 800, height: 600 },
    zoomLevel: { x: 0, y: 0, zoom: 1.15 },
    onclose: fn(),
    oncoordschange: fn(),
    coords: [
      { x: 0, y: -92 },
      { x: 80, y: 42 },
      { x: -78, y: 54 },
    ],
  },
});
</script>

<Story name="Triangle Drag Points">
  {#snippet template(args)}
    <div style="position: relative; width: 100%; height: 100vh; background: linear-gradient(160deg, #e8efff 0%, #fff3e8 100%);">
      <DeepEdit {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Non Convex 12 Gon"
  args={{
    zoomLevel: { x: 0, y: 0, zoom: 1.65 },
    coords: [
      { x: 0, y: -96 },
      { x: 24, y: -58 },
      { x: 88, y: -70 },
      { x: 52, y: -24 },
      { x: 94, y: 8 },
      { x: 42, y: 28 },
      { x: 68, y: 92 },
      { x: 10, y: 52 },
      { x: -34, y: 96 },
      { x: -38, y: 30 },
      { x: -92, y: 12 },
      { x: -28, y: -34 },
    ],
  }}
>
  {#snippet template(args)}
    <div style="position: relative; width: 100%; height: 100vh; background: linear-gradient(160deg, #e8efff 0%, #fff3e8 100%);">
      <DeepEdit {...args} />
    </div>
  {/snippet}
</Story>
