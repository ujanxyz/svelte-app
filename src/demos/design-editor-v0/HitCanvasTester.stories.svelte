<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";

import HitCanvasTester from "./HitCanvasTester.svelte";

const { Story } = defineMeta({
  title: "Demos/DesignEditorV0/HitCanvasTester",
  component: HitCanvasTester,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
});
</script>

<Story name="Default" />
