<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";

import MockOverlayInstanceProvider from "@/modules/overlay2/MockOverlayInstanceProvider.svelte";

import MediaManager from "./MediaManager.svelte";

const { Story } = defineMeta({
  title: "FnGallery/MediaManager",
  component: MediaManager,
  tags: ["autodocs"],
  args: {
    forceStatic: true,
  },
});
</script>

<Story name="Default">
  {#snippet template(args: any)}
    <MockOverlayInstanceProvider>
      <MediaManager {...args} />
    </MockOverlayInstanceProvider>
  {/snippet}
</Story>

<Story name="Compact Container">
  {#snippet template(args: any)}
    <MockOverlayInstanceProvider>
      <div style="width: 100%; height: 880px;">
        <MediaManager {...args} />
      </div>
    </MockOverlayInstanceProvider>
  {/snippet}
</Story>
