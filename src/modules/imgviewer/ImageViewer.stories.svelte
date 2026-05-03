<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";

import ImageViewer from "./ImageViewer.svelte";
import MockImageViewerProvider from "./MockImageViewerProvider.svelte";

const { Story } = defineMeta({
  title: "ImgViewer/ImageViewer",
  component: ImageViewer,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
});
</script>

<!-- ── Story: Landscape HD ─────────────────────────────────────────────────── -->
<Story name="Landscape HD">
  {#snippet template()}
    <MockImageViewerProvider
      id="landscape.3f9a1b2c8d4e7f0a.jpg"
      filename="mountain-view.7bb3a0ed.jpg"
      width={1280}
      height={720}
      mimeType="image/jpeg"
      byteSize={1024 * 620}
    >
      <ImageViewer />
    </MockImageViewerProvider>
  {/snippet}
</Story>

<!-- ── Story: Portrait ────────────────────────────────────────────────────── -->
<Story name="Portrait">
  {#snippet template()}
    <MockImageViewerProvider
      id="portrait.a1b2c3d4e5f6a7b8.png"
      filename="forest-trail.a1b2c3d4.png"
      width={720}
      height={1280}
      mimeType="image/png"
      byteSize={1024 * 980}
    >
      <ImageViewer />
    </MockImageViewerProvider>
  {/snippet}
</Story>

<!-- ── Story: Small image (zoomed in initial view) ────────────────────────── -->
<Story name="Small Image">
  {#snippet template()}
    <MockImageViewerProvider
      id="small.deadbeef01234567.png"
      filename="icon-preview.deadbeef.png"
      width={320}
      height={240}
      mimeType="image/png"
      byteSize={1024 * 48}
    >
      <ImageViewer />
    </MockImageViewerProvider>
  {/snippet}
</Story>

<!-- ── Story: Constrained container (simulates overlay sizing) ───────────── -->
<Story name="In 600 x 400 Container">
  {#snippet template()}
    <div style="width: 600px; height: 400px; overflow: hidden; border: 1px dashed #888; display: flex; align-items: center; justify-content: center;">
      <MockImageViewerProvider
        id="contained.0011223344556677.jpg"
        filename="city-skyline.00112233.jpg"
        width={1280}
        height={720}
        mimeType="image/jpeg"
        byteSize={1024 * 840}
      >
        <ImageViewer />
      </MockImageViewerProvider>
    </div>
  {/snippet}
</Story>
