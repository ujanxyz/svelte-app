<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";

import MockOverlayInstanceProvider from "@/modules/overlay2/MockOverlayInstanceProvider.svelte";

import MediaManager from "./MediaManager.svelte";
import MockMediaManagerProvider from "./MockMediaManagerProvider.svelte";

const { Story } = defineMeta({
  title: "features/MediaManager",
  component: MediaManager,
  tags: ["autodocs"],
  args: {},
});

const mockPicUrls = ["/pics/liberty.png", "/pics/peacock.jpg", "/pics/sunflower.jpg"];
</script>

<Story name="Default">
  {#snippet template(args: any)}
    <div style="width: 100%; height: 100vh;">
      <MockOverlayInstanceProvider>
        <MockMediaManagerProvider picUrls={mockPicUrls}>
          <MediaManager {...args} />
        </MockMediaManagerProvider>
      </MockOverlayInstanceProvider>
    </div>
  {/snippet}
</Story>

<Story name="Compact Container">
  {#snippet template(args: any)}
    <div style="width: 100%; height: 100vh;">
      <MockOverlayInstanceProvider>
        <MockMediaManagerProvider picUrls={mockPicUrls}>
          <MediaManager {...args} />
        </MockMediaManagerProvider>
      </MockOverlayInstanceProvider>
    </div>
  {/snippet}
</Story>

<Story name="Empty">
  {#snippet template(args: any)}
    <div style="width: 100%; height: 100vh;">
      <MockOverlayInstanceProvider>
        <MockMediaManagerProvider picUrls={[]}>
          <MediaManager {...args} />
        </MockMediaManagerProvider>
      </MockOverlayInstanceProvider>
    </div>
  {/snippet}
</Story>
