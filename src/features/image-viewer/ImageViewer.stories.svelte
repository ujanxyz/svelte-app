<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";

import ImageViewer from "./ImageViewer.svelte";
import MockImageViewerProvider from "./MockImageViewerProvider.svelte";

const { Story } = defineMeta({
  title: "features/image-viewer/ImageViewer",
  component: ImageViewer,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
});

const mockPicUrls = ["/pics/liberty.png", "/pics/peacock.jpg", "/pics/sunflower.jpg"];
</script>

<!-- ── Story: Liberty (PNG) ──────────────────────────────────────────────── -->
<Story name="Liberty (from public/pics)">
  {#snippet template()}
    <MockImageViewerProvider
      id={mockPicUrls[0]}
      filename="liberty.png"
      picUrl={mockPicUrls[0]}
    >
      <ImageViewer />
    </MockImageViewerProvider>
  {/snippet}
</Story>

<!-- ── Story: Peacock (JPG) ────────────────────────────────────────────────── -->
<Story name="Peacock (from public/pics)">
  {#snippet template()}
    <MockImageViewerProvider
      id={mockPicUrls[1]}
      filename="peacock.jpg"
      picUrl={mockPicUrls[1]}
    >
      <ImageViewer />
    </MockImageViewerProvider>
  {/snippet}
</Story>

<!-- ── Story: Sunflower (JPG) ──────────────────────────────────────────────── -->
<Story name="Sunflower (from public/pics)">
  {#snippet template()}
    <MockImageViewerProvider
      id={mockPicUrls[2]}
      filename="sunflower.jpg"
      picUrl={mockPicUrls[2]}
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
        id={mockPicUrls[0]}
        filename="liberty.png"
        picUrl={mockPicUrls[0]}
      >
        <ImageViewer />
      </MockImageViewerProvider>
    </div>
  {/snippet}
</Story>
