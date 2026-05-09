<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";

import LoadingSpinner from "./LoadingSpinner.svelte";

const { Story } = defineMeta({
  title: "Components/LoadingSpinner",
  component: LoadingSpinner,
  tags: ["autodocs"],
  args: {
    iconSize: 32,
    stepDeg: 8,
    intervalMs: 16,
  },
});
</script>

<Story name="Default">
  {#snippet template(args)}
    <div style="display: grid; place-items: center; min-height: 12rem;">
      <LoadingSpinner iconSize={args.iconSize} stepDeg={args.stepDeg} intervalMs={args.intervalMs} />
    </div>
  {/snippet}
</Story>

<Story name="Large Icon">
  {#snippet template()}
    <div style="display: grid; place-items: center; min-height: 12rem;">
      <LoadingSpinner iconSize={48} />
    </div>
  {/snippet}
</Story>

<Story name="Small Icon">
  {#snippet template()}
    <div style="display: grid; place-items: center; min-height: 12rem;">
      <LoadingSpinner iconSize={24} />
    </div>
  {/snippet}
</Story>