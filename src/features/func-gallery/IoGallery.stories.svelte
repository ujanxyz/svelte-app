<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";

import MockOverlayInstanceProvider from "@/modules/overlay2/MockOverlayInstanceProvider.svelte";

import IoGallery from "./IoGallery.svelte";

const { Story } = defineMeta({
  title: "features/func-gallery/IoGallery",
  component: IoGallery,
  tags: ["autodocs"],
  args: {
    initialMode: "IN" as "IN" | "OUT",
  },
});
</script>

<Story name="Input Mode" args={{ initialMode: "IN" }}>
  {#snippet template(args)}
    <MockOverlayInstanceProvider>
      <IoGallery {...args} />
    </MockOverlayInstanceProvider>
  {/snippet}
</Story>

<Story name="Output Mode" args={{ initialMode: "OUT" }}>
  {#snippet template(args)}
    <MockOverlayInstanceProvider>
      <IoGallery {...args} />
    </MockOverlayInstanceProvider>
  {/snippet}
</Story>

<Story name="Mobile Width Preview" args={{ initialMode: "IN" }}>
  {#snippet template(args)}
    <div style="position: relative; width: 720px; height: 520px; margin: 0 auto;">
      <MockOverlayInstanceProvider>
        <IoGallery {...args} />
      </MockOverlayInstanceProvider>
    </div>
  {/snippet}
</Story>
