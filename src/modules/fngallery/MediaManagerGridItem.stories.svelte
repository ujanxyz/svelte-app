<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import { fn } from "storybook/test";

import MediaManagerGridItem from "./MediaManagerGridItem.svelte";

const sample = {
  id: "m2",
  displayName: "City_Night.webp",
  filename: "city_night.webp",
  width: 3840,
  height: 2160,
  sizeLabel: "3.21 MB",
  kind: "WEBP",
  addedAt: Date.now(),
  addedAgoLabel: "3 hours ago",
  thumbnailUrl: "https://i.pravatar.cc/100?u=story-grid-1",
} as const;

const { Story } = defineMeta({
  title: "FnGallery/MediaManagerGridItem",
  component: MediaManagerGridItem,
  tags: ["autodocs"],
  args: {
    item: sample,
    checked: false,
    oncheck: fn(),
    ondelete: fn(),
    onmenu: fn(),
  },
});
</script>

<Story name="Default">
  {#snippet template(args)}
    <div style="width: 300px; background: #e8e8e8; border: 1px solid #c4c4c4; border-radius: 10px; padding: 10px;">
      <MediaManagerGridItem {...args} />
    </div>
  {/snippet}
</Story>

<Story name="Checked" args={{ checked: true }}>
  {#snippet template(args)}
    <div style="width: 300px; background: #e8e8e8; border: 1px solid #c4c4c4; border-radius: 10px; padding: 10px;">
      <MediaManagerGridItem {...args} />
    </div>
  {/snippet}
</Story>
