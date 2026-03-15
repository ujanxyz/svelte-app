<script lang="ts">
import { ReturnStatus } from "@/overlay/constants";
import { useOverlayUi } from "@/overlay/overlayStore";

import DataPicker from "./DataPicker.svelte";
import SlotPaneButton from "./SlotPaneButton.svelte";

interface Props {}

const {}: Props = $props();

const editorPopup = useOverlayUi(miniEditor);

async function onClickSlotBtn(
  datatype: string,
  anchor: HTMLButtonElement,
): Promise<void> {
  console.log("datatype = ", datatype);
  const editedData = await editorPopup.openOverlayAsync<{
    datatype: string;
    payload: any;
  }>({ anchor, datatype });
  console.log(editedData);
  if (editedData.status !== ReturnStatus.OK) return;
}
</script>

<SlotPaneButton datatype="coord2d" onTrigger={onClickSlotBtn}>
  in-coord2d: coord2d
</SlotPaneButton>

<SlotPaneButton datatype="color" onTrigger={onClickSlotBtn}>
  in-color: color
</SlotPaneButton>

<SlotPaneButton datatype="text" onTrigger={onClickSlotBtn}>
  text1: text
</SlotPaneButton>

{#snippet miniEditor()}
  <DataPicker />
{/snippet}

<style>
</style>
