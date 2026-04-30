<script lang="ts" module>
import type { plstate } from "@/types/plstate";

export interface ManualInputOverlayPayload {
  dtypeStr: string;
  priorIoData: plstate.EncodedData | null;
  rawNodeId: number;
  triggerRect: DOMRect;
};

</script>

<script lang="ts">
import { onMount } from "svelte";

import { useOverlayInstance } from "@/modules/overlay2";
import PickColors from "@/modules/sloteditor/PickColors.svelte";
import PickCoords2D from "@/modules/sloteditor/PickCoords2D.svelte";
import PickFile from "@/modules/sloteditor/PickFile.svelte";
import PickFloats from "@/modules/sloteditor/PickFloats.svelte";
import PickTexts from "@/modules/sloteditor/PickTexts.svelte";
import type { ClientXY } from "@/overlay/types";


interface Props {}

const {}: Props = $props();

let clientXY = $state<ClientXY>({ x: 0, y: 0 });

/**
 * CSS vars controlling the menu position.
 */
const styleString: string = $derived(
  `left: ${clientXY.x}px; top: ${clientXY.y}px;`,
);

const overlay = useOverlayInstance<ManualInputOverlayPayload, plstate.EncodedData>();

const { dtypeStr: payloadDatatype, priorIoData, rawNodeId, triggerRect } = overlay.payload as {
  dtypeStr: string;
  priorIoData: plstate.EncodedData | null;
  rawNodeId: number;
  triggerRect: DOMRect;
};

//---------------

onMount(() => {
  const { left: clientLeft, top: clientTop } = triggerRect as DOMRect;
  clientXY = { x: clientLeft, y: clientTop };
});

function onData(edited: plstate.EncodedData): void {
  console.log("onData = ", edited);
  overlay.settle(edited);
}

function onChangeFile(ev: Event): void {
  const fileInput = ev.currentTarget as HTMLInputElement;
  const file = fileInput.files ? fileInput.files[0] : null;
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const result = e.target?.result;
      if (typeof result === "string") {
        console.log(result);
      }
    };
    reader.readAsDataURL(file);
  }
}

</script>

<div class="layer contextmenu" style={styleString}>
  <span class="title"> Picker: {payloadDatatype} </span>
  {#if payloadDatatype === "points2d"}
    <PickCoords2D initial={priorIoData} {onData} />
  {:else if payloadDatatype === "floats"}
    <PickFloats initial={priorIoData} {onData} />
  {:else if payloadDatatype === "colors"}
    <PickColors initial={priorIoData} {onData} />
  {:else if payloadDatatype === "bitmap"}
    <PickFile initial={priorIoData} {onData} />
  {:else}
    Bad payload type: {payloadDatatype}
  {/if}

  <!-- <textarea bind:value={rawText} placeholder="Encoded payload (JSON)" rows="8"></textarea> -->
</div>

<style>
.layer {
  border-radius: 4px;
  overflow: visible;
  box-shadow: 4px 4px 6px 2px rgba(0, 0, 0, 0.2);

  position: fixed;
  left: var(--left, 0);
  top: var(--top, 0);
  width: 240px;
  height: auto;

  background-color: #222222;
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  row-gap: 4px;
}

.contextmenu {
  padding-top: calc(0.2rem + 1px);
  padding-bottom: calc(0.2rem + 1px);
  padding-left: 6px;
  padding-right: 6px;

  background-color: #222222;
  border-radius: 4px;

  display: flex;
  flex-direction: column;
  align-items: stretch;
  row-gap: 4px;
}
.title {
  font-size: small;
  font-weight: 600;
}
</style>
