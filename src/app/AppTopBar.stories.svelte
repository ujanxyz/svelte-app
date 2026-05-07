<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";

import AppTopBar from "./AppTopBar.svelte";

const { Story } = defineMeta({
  title: "App/AppTopBar",
  component: AppTopBar,
  tags: ["autodocs"],
});
</script>

<Story name="Default">
  {#snippet template()}
    <div style="width: 900px; border: 1px solid var(--color-border-subtle); border-radius: 8px; overflow: hidden; background: var(--color-bg-0);">
      <AppTopBar />
    </div>
  {/snippet}
</Story>

<Story name="Narrow Width">
  {#snippet template()}
    <div style="width: 360px; border: 1px solid var(--color-border-subtle); border-radius: 8px; overflow: hidden; background: var(--color-bg-0);">
      <AppTopBar />
    </div>
  {/snippet}
</Story>
