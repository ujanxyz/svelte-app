<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import { fn } from "storybook/test";

import CubicBezierEditor from "./CubicBezierEditor.svelte";

const { Story } = defineMeta({
  title: "Demos/DesignEditorV0/CubicBezierEditor",
  component: CubicBezierEditor,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    shapeType: "cubic-bezier",
    viewDimension: { width: 1280, height: 900 },
    zoomLevel: { x: 0, y: 0, zoom: 1.2 },
    onclose: fn(),
    onpathchange: fn(),
    path: {
      closed: true,
      segments: [
        { p: { x: -58, y: -60 }, c0: { x: -84, y: -66 }, c1: { x: -34, y: -78 }, type: "smooth" },
        { p: { x: 8, y: -72 }, c0: { x: -14, y: -72 }, c1: { x: 34, y: -60 }, type: "smooth" },
        { p: { x: 72, y: -18 }, c0: { x: 56, y: -50 }, c1: { x: 84, y: 12 }, type: "sym" },
        { p: { x: 46, y: 64 }, c0: { x: 72, y: 52 }, c1: { x: 12, y: 82 }, type: "auto" },
        { p: { x: -42, y: 56 }, c0: { x: -2, y: 60 }, c1: { x: -72, y: 34 }, type: "cusp" },
      ],
    },
  },
});
</script>

<Story name="Closed Mixed Node Types">
  {#snippet template(args)}
    <div style="position: relative; width: 100%; height: 100vh; background: linear-gradient(160deg, #e8efff 0%, #fff3e8 100%);">
      <CubicBezierEditor {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Open Wave Path"
  args={{
    zoomLevel: { x: 0, y: 0, zoom: 1.05 },
    path: {
      closed: false,
      segments: [
        { p: { x: -90, y: 8 }, c0: { x: -96, y: -6 }, c1: { x: -58, y: -24 }, type: "cusp" },
        { p: { x: -24, y: -42 }, c0: { x: -52, y: -42 }, c1: { x: 6, y: -58 }, type: "smooth" },
        { p: { x: 36, y: -4 }, c0: { x: 8, y: -18 }, c1: { x: 62, y: 22 }, type: "sym" },
        { p: { x: 90, y: 46 }, c0: { x: 72, y: 22 }, c1: { x: 96, y: 68 }, type: "auto" },
      ],
    },
  }}
>
  {#snippet template(args)}
    <div style="position: relative; width: 100%; height: 100vh; background: linear-gradient(160deg, #e8efff 0%, #fff3e8 100%);">
      <CubicBezierEditor {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Zoomed In Auto Smooth"
  args={{
    zoomLevel: { x: -6, y: -4, zoom: 2.1 },
    path: {
      closed: true,
      segments: [
        { p: { x: -70, y: -26 }, c0: { x: -88, y: -38 }, c1: { x: -44, y: -60 }, type: "auto" },
        { p: { x: -22, y: -72 }, c0: { x: -40, y: -72 }, c1: { x: 8, y: -72 }, type: "auto" },
        { p: { x: 48, y: -54 }, c0: { x: 22, y: -68 }, c1: { x: 72, y: -30 }, type: "auto" },
        { p: { x: 78, y: 8 }, c0: { x: 86, y: -12 }, c1: { x: 84, y: 28 }, type: "auto" },
        { p: { x: 38, y: 68 }, c0: { x: 60, y: 54 }, c1: { x: 4, y: 78 }, type: "auto" },
        { p: { x: -38, y: 56 }, c0: { x: -4, y: 74 }, c1: { x: -72, y: 40 }, type: "auto" },
      ],
    },
  }}
>
  {#snippet template(args)}
    <div style="position: relative; width: 100%; height: 100vh; background: linear-gradient(160deg, #e8efff 0%, #fff3e8 100%);">
      <CubicBezierEditor {...args} />
    </div>
  {/snippet}
</Story>
