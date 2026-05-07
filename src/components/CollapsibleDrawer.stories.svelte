<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";

import CollapsibleDrawer from "./CollapsibleDrawer.svelte";

const { Story } = defineMeta({
  title: "Components/CollapsibleDrawer",
  component: CollapsibleDrawer,
  tags: ["autodocs"],
  args: {
    title: "Categories",
  },
});
</script>

<!-- ── Open state (default) ───────────────────────────────────────── -->
<Story name="Open">
  {#snippet template(args)}
    <div style="position: relative; width: 640px; height: 400px; background: var(--color-bg-0); border: 1px solid var(--color-border-subtle); border-radius: 8px; overflow: hidden;">
      <CollapsibleDrawer {...args} panelClass="story-tint-blue">
        <ul style="padding: 0.75rem 0.85rem; margin: 0; list-style: none; display: flex; flex-direction: column; gap: 0.35rem;">
          <li style="font-weight: 700; font-size: 0.85rem; color: var(--text-primary);">All (20)</li>
          <li style="border-top: 1px solid var(--color-border-subtle); margin: 0.25rem 0;"></li>
          <li style="font-size: 0.83rem; color: var(--text-primary);">/gen (5)</li>
          <li style="font-size: 0.83rem; color: var(--text-primary);">/noise (4)</li>
          <li style="font-size: 0.83rem; color: var(--text-primary);">/sampling (4)</li>
          <li style="font-size: 0.83rem; color: var(--text-primary);">/vec2 (4)</li>
          <li style="font-size: 0.83rem; color: var(--text-primary);">/color (3)</li>
        </ul>
      </CollapsibleDrawer>
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--text-tertiary); font-size: 0.9rem; pointer-events: none;">
        Main content area
      </div>
    </div>
  {/snippet}
</Story>

<!-- ── Tint Variants ──────────────────────────────────────────────── -->
<Story name="Tint Variants">
  {#snippet template(args)}
    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
      {#each [
        { label: "Blue", cls: "story-tint-blue" },
        { label: "Green", cls: "story-tint-green" },
        { label: "Purple", cls: "story-tint-purple" },
        { label: "Blue 25%", cls: "story-tint-blue-strong" },
      ] as variant}
        <div style="position: relative; width: 240px; height: 260px; background: var(--color-bg-0); border: 1px solid var(--color-border-subtle); border-radius: 8px; overflow: hidden;">
          <CollapsibleDrawer title={variant.label} panelClass={variant.cls}>
            <p style="padding: 0.75rem; font-size: 0.82rem; color: var(--text-secondary);">{variant.label}</p>
          </CollapsibleDrawer>
        </div>
      {/each}
    </div>
  {/snippet}
</Story>

<style>
/* Tint class examples — defined here in the story so callers can see the pattern */
:global(.story-tint-blue)        { background: var(--tint-blue); }
:global(.story-tint-green)       { background: var(--tint-green); }
:global(.story-tint-purple)      { background: var(--tint-purple); }
:global(.story-tint-blue-strong) { background: color-mix(in oklab, var(--color-bg-2), #2186f1 25%); }
</style>
