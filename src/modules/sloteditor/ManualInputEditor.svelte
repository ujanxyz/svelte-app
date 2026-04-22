<script lang="ts">
import { onMount } from "svelte";

import type { UjOverrideData } from "@/graph/types";
import type { ClientXY } from "@/overlay/types";
import useCurrentOverlay from "@/overlay/useCurrentOverlay";
import type { plstate } from "@/types/plstate";

import PickColors from "./PickColors.svelte";
import PickCoords2D from "./PickCoords2D.svelte";
import PickTexts from "./PickTexts.svelte";

interface Props {}

const {}: Props = $props();

let clientXY = $state<ClientXY>({ x: 0, y: 0 });
let datatype = $state<string>("");
let ioData = $state.raw<plstate.EncodedData | null>(null);
let rawText = $state<string>("");

/**
 * CSS vars controlling the menu position.
 */
const styleString: string = $derived(
  `left: ${clientXY.x}px; top: ${clientXY.y}px;`,
);

const current = useCurrentOverlay();

onMount(() => {
  const {
    anchor,
    datatype: payloadDatatype,
    priorIoData,
    triggerRect
  } = current.getLayerPayload();
  console.log(current.getLayerPayload());

  const { left: clientLeft, bottom: clientBottom } = triggerRect as DOMRect;
  clientXY = { x: clientLeft, y: clientBottom };
  ioData = priorIoData as plstate.EncodedData | null;
  rawText = JSON.stringify(ioData, null, 2);
});

function onData(typedPayload: object) {
  // const ujData: UjOverrideData = {
  //   datatype,
  //   timestamp: Date.now(),
  //   payload: typedPayload,
  // };
  current.settleOverlay(null);
}

function applyRawPayload() {
  current.settleOverlay(JSON.parse(rawText));
}
</script>

<div class="layer contextmenu" style={styleString}>
  <span class="title"> Picker: {datatype} </span>
  <span> {JSON.stringify(ioData)} </span>
  <textarea bind:value={rawText} placeholder="Encoded payload (JSON)" rows="8"></textarea>
  <button onclick={applyRawPayload}>Apply</button>
</div>

<style>
.layer {
  border-radius: 4px;
  overflow: visible;
  box-shadow: 4px 4px 6px 2px rgba(0, 0, 0, 0.2);

  position: fixed;
  left: var(--left, 0);
  top: var(--top, 0);

  background-color: #222222;
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  row-gap: 4px;
}

.contextmenu {
  padding-top: calc(0.2rem + 1px);
  /* padding-bottom: calc(0.2rem + 1px); */
  padding-bottom: 80px;
  padding-left: 6px;
  padding-right: 6px;

  width: 400px;
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
