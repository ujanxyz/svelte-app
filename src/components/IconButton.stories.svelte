<script module>
import { defineMeta } from "@storybook/addon-svelte-csf";
import BellSimpleIcon from "phosphor-svelte/lib/BellSimpleIcon";
import { fn } from "storybook/test";

import IconButton from "./IconButton.svelte";

const { Story } = defineMeta({
  title: "Components/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  args: {
    tooltip: "Notifications",
    onclick: fn(),
  },
});
</script>

<Story name="Bell Icon">
  {#snippet template(args)}
    <IconButton tooltip={args.tooltip} onclick={args.onclick}>
      <BellSimpleIcon size={18} weight="bold" />
    </IconButton>
  {/snippet}
</Story>
