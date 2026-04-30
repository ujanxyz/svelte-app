<script module>
import { defineMeta } from "@storybook/addon-svelte-csf";
import { fn } from "storybook/test";

import ButtonGroup from "./ButtonGroup.svelte";

const demoButtons = [
  { label: "Graph", code: "graph" },
  { label: "Stage", code: "stage" },
  { label: "Worker", code: "worker" },
];

const { Story } = defineMeta({
  title: "Components/ButtonGroup",
  component: ButtonGroup,
  tags: ["autodocs"],
  args: {
    buttons: demoButtons,
    value: "graph",
    onselect: fn(),
  },
});
</script>

<Story name="Default" />

<Story name="Preselected" args={{ value: "worker" }} />
