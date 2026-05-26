<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";

import EditorPage from "./EditorPage.svelte";

const { Story } = defineMeta({
  title: "Demos/DesignEditorV0/EditorPage",
  component: EditorPage,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
});
</script>

<Story name="Default">
  {#snippet template()}
    <div style="width: min(90vw, 800px); height: min(80vh, 600px);">
      <EditorPage />
    </div>
  {/snippet}
</Story>
