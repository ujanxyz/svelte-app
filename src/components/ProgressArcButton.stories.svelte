<script module>
import { defineMeta } from "@storybook/addon-svelte-csf";
import { fn } from "storybook/test";

import ProgressArcButton from "./ProgressArcButton.svelte";

const { Story } = defineMeta({
  title: "Components/ProgressArcButton",
  component: ProgressArcButton,
  tags: ["autodocs"],
  args: {
    iconSize: 18,
    color: "#d14343",
    onClose: fn(),
  },
});
</script>

<Story name="Default" />

<Story name="Large Green" args={{ iconSize: 24, color: "#2f9e44", initialProgress: 0.25 }} />

<Story name="Small 10%" args={{ iconSize: 24, color: "#889900", initialProgress: 0.1 }} />
