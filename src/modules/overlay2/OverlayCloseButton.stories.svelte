<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";

import MockOverlayInstanceProvider from "./MockOverlayInstanceProvider.svelte";
import OverlayCloseButton from "./OverlayCloseButton.svelte";

const { Story } = defineMeta({
  title: "modules/overlay2/OverlayCloseButton",
  component: OverlayCloseButton,
  tags: ["autodocs"],
  args: {},
});
</script>

<Story name="Default">
  {#snippet template(args)}
    <MockOverlayInstanceProvider>
      <OverlayCloseButton {...args} />
    </MockOverlayInstanceProvider>
  {/snippet}
</Story>

<Story
  name="Large Icon"
  args={{
    iconProps: { size: 20, weight: "bold" },
  }}
>
  {#snippet template(args)}
    <MockOverlayInstanceProvider>
      <OverlayCloseButton {...args} />
    </MockOverlayInstanceProvider>
  {/snippet}
</Story>

<Story
  name="Light Weight Icon"
  args={{
    iconProps: { size: 14, weight: "light" },
  }}
>
  {#snippet template(args)}
    <MockOverlayInstanceProvider>
      <OverlayCloseButton {...args} />
    </MockOverlayInstanceProvider>
  {/snippet}
</Story>