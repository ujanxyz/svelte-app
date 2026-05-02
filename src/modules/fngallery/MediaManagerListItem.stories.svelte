<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import { fn } from "storybook/test";

import MediaManagerListItem from "./MediaManagerListItem.svelte";

const sample = {
  id: "m1",
  displayName: "Mountains_Lake.jpg",
  filename: "mountains_lake.jpg",
  width: 2560,
  height: 1440,
  sizeLabel: "2.34 MB",
  kind: "JPG",
  addedAt: Date.now(),
  addedAgoLabel: "2 minutes ago",
  thumbnailUrl: "https://i.pravatar.cc/100?u=story-list-1",
} as const;

const { Story } = defineMeta({
  title: "FnGallery/MediaManagerListItem",
  component: MediaManagerListItem,
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
    <div style="width: 980px; background: #e8e8e8; border: 1px solid #c4c4c4; border-radius: 10px;">
      <MediaManagerListItem {...args} />
    </div>
  {/snippet}
</Story>

<Story name="Checked" args={{ checked: true }}>
  {#snippet template(args)}
    <div style="width: 980px; background: #e8e8e8; border: 1px solid #c4c4c4; border-radius: 10px;">
      <MediaManagerListItem {...args} />
    </div>
  {/snippet}
</Story>
