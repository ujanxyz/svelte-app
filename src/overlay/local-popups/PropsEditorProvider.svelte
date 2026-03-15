<script lang="ts">
import { setContext, type Snippet } from "svelte";

import { ReturnStatus } from "../constants";
import { useOverlayUi } from "../overlayStore";
import type { ClientXY } from "../types";
import PropsEditor from "./PropsEditor.svelte";

interface Props {
  children: Snippet;
}
const { children }: Props = $props();

const overlayMenu = useOverlayUi(renderPropEditor);
setContext("propseditor", { editPropsAsync });

async function editPropsAsync(
  anchor: HTMLDivElement,
  initial: string,
): Promise<string | null> {
  const retValue = await overlayMenu.openOverlayAsync({
    anchor,
    lorem: initial,
  });
  if (retValue.status !== ReturnStatus.OK) {
    return null;
  }
  const { editedLorem } = retValue.value as { editedLorem: string };
  return editedLorem ?? null;
}
</script>

{#snippet renderPropEditor()}
  <PropsEditor />
{/snippet}

{@render children()}
