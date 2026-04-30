<script module>
import { defineMeta } from "@storybook/addon-svelte-csf";

import RadioBtnGroup from "./RadioBtnGroup.svelte";

const { Story } = defineMeta({
  title: "Components/RadioBtnGroup",
  component: RadioBtnGroup,
  tags: ["autodocs"],
  args: {
    group: "storybook-radio",
  },
});
</script>

<Story name="Default" />
