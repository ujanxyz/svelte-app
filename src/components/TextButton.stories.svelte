<script module>
import { defineMeta } from "@storybook/addon-svelte-csf";
import { fn } from "storybook/test";

import TextButton from "./TextButton.svelte";

const { Story } = defineMeta({
  title: "Components/TextButton",
  component: TextButton,
  tags: ["autodocs"],
  args: {
    text: "Run Action",
    onclick: fn(),
  },
});
</script>

<Story name="Default" />

<Story name="Long Label" args={{ text: "Run Full Diagnostics" }} />
