<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import { fn as testFn } from "storybook/test";

import type { fn } from "@/types/function";

import FnGroupList from "./FnGroupList.svelte";

const demoItems: fn.FunctionInfo[] = [
  { uri: "/gen/grid", label: "Grid 2D", desc: "", params: [] },
  { uri: "/gen/line", label: "Line / Path", desc: "", params: [] },
  { uri: "/gen/circle", label: "Circle Points", desc: "", params: [] },
  { uri: "/gen/random-disk", label: "Random in Circle", desc: "", params: [] },
  { uri: "/gen/range", label: "Float Range", desc: "", params: [] },
  { uri: "/noise/perlin-2d", label: "Perlin Noise", desc: "", params: [] },
  { uri: "/noise/simplex-3d", label: "Simplex 3D", desc: "", params: [] },
  { uri: "/noise/fbm", label: "Fractal Brownian Motion", desc: "", params: [] },
  { uri: "/noise/cellular", label: "Cellular Noise", desc: "", params: [] },
  { uri: "/sampling/remap", label: "Remap Range", desc: "", params: [] },
  { uri: "/sampling/color-ramp", label: "Color Ramp", desc: "", params: [] },
  { uri: "/sampling/threshold", label: "Step / Threshold", desc: "", params: [] },
  { uri: "/vec2/add-force", label: "Add Force", desc: "", params: [] },
  { uri: "/vec2/rotate", label: "Rotate", desc: "", params: [] },
  { uri: "/color/analyze-brightness", label: "Analyze Brightness", desc: "", params: [] },
  { uri: "/color/hue-shift", label: "Hue Shift", desc: "", params: [] },
  { uri: "/color/blend", label: "Blend", desc: "", params: [] },
];

const demoEntries = demoItems.map((info) => {
  const parts = info.uri.split("/");
  const category = parts.length >= 2 && parts[1] ? `/${parts[1]}` : "/other";
  return { info, category };
});

const { Story } = defineMeta({
  title: "features/func-gallery/FnGroupList",
  component: FnGroupList,
  tags: ["autodocs"],
  args: {
    entries: demoEntries,
    initialFilterCategory: null,
    onFilterChange: testFn(),
  },
});
</script>

<script lang="ts">
let api: { clearFilter: () => void } | null = null;
</script>

<!-- ── All categories, no filter ──────────────────────────────────── -->
<Story name="Default">
  {#snippet template(args)}
    <div style="position: relative; width: 480px; height: 380px; background: var(--color-bg-0); border: 1px solid var(--color-border-subtle); border-radius: 8px; overflow: hidden;">
      <FnGroupList {...args} />
    </div>
  {/snippet}
</Story>

<!-- ── Active filter: /noise ──────────────────────────────────────── -->
<Story name="Filter Active">
  {#snippet template(args)}
    <div style="position: relative; width: 480px; height: 380px; background: var(--color-bg-0); border: 1px solid var(--color-border-subtle); border-radius: 8px; overflow: hidden;">
      <FnGroupList {...args} initialFilterCategory="/noise" />
    </div>
  {/snippet}
</Story>

<!-- ── Collapsed (hamburger shown) ───────────────────────────────── -->
<Story name="Collapsed">
  {#snippet template(args)}
    <div style="position: relative; width: 480px; height: 380px; background: var(--color-bg-0); border: 1px solid var(--color-border-subtle); border-radius: 8px; overflow: hidden;">
      <FnGroupList {...args} />
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-size:0.9rem; color: var(--text-tertiary); pointer-events:none;">
        Click the hamburger/list icon to toggle the sidebar
      </div>
    </div>
  {/snippet}
</Story>

<Story name="Method: clearFilter()">
  {#snippet template(args)}
    <div style="display: flex; flex-direction: column; gap: 10px; width: 480px;">
      <button
        style="width: fit-content; padding: 6px 10px; border: 1px solid var(--color-border-subtle); border-radius: 6px; background: var(--color-bg-1); color: var(--text-primary); cursor: pointer;"
        onclick={() => api?.clearFilter()}
      >
        Call clearFilter()
      </button>

      <div style="position: relative; width: 480px; height: 380px; background: var(--color-bg-0); border: 1px solid var(--color-border-subtle); border-radius: 8px; overflow: hidden;">
        <FnGroupList bind:this={api} {...args} initialFilterCategory="/noise" />
      </div>
    </div>
  {/snippet}
</Story>
