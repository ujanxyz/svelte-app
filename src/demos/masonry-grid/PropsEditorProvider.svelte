<script lang="ts">
import { setContext, type Snippet } from "svelte";

import * as overlay2 from "@/modules/overlay2";

import PropsEditor, { type PropsEditorPayload, type PropsEditorResult } from "./PropsEditor.svelte";

const overlayMgr = overlay2.useOverlayManager();
const propsEditor = overlay2.createOverlayController<PropsEditorPayload, PropsEditorResult>(overlayMgr, renderPropEditor);

interface Props {
  children: Snippet;
}
const { children }: Props = $props();

setContext("propseditor", { editPropsAsync });

async function editPropsAsync(
  anchor: HTMLDivElement,
  initial: string,
): Promise<string | null> {
  const retValue: overlay2.OverlayResult<PropsEditorResult> = await propsEditor.open({
    anchor,
    lorem: initial,
  });
  if (retValue.status !== overlay2.overlayStatuses.OK) {
    return null;
  }
  const { editedLorem } = retValue.value;
  return editedLorem ?? null;
}
</script>

{#snippet renderPropEditor()}
  <PropsEditor />
{/snippet}

{@render children()}
