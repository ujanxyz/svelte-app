<script lang="ts">
import { Color } from "svelte-tweakpane-ui";
import { Button } from "svelte-tweakpane-ui";
import PickColors from "./PickColors.svelte";
import useCurrentOverlay from "@/overlay/useCurrentOverlay";
import type { ClientXY } from "@/overlay/types";
import PickCoords2D from "./PickCoords2D.svelte";
import PickTexts from "./PickTexts.svelte";
import type { UjOverrideData } from "@/graph/types";

interface Props {
}

const { }: Props = $props();

let clientXY = $state<ClientXY>({ x: 0, y: 0 });
let datatype = $state<string>("");
let initial = $state.raw<object | null>(null);

/**
 * CSS vars controlling the menu position.
 */
const styleString: string = $derived(
  `left: ${clientXY.x}px; top: ${clientXY.y}px;`,
);

const current = useCurrentOverlay();

$effect.pre(() => {
  const { anchor, datatype: payloadDatatype, prior } = current.getLayerPayload();
  if (prior === undefined) {
    // `prior` can be null, but still should be set in overlay caller.
    throw new Error("Not found: prior");
  }
  const rect = (anchor as HTMLDivElement).getBoundingClientRect();
  clientXY = {x: rect.left, y: rect.bottom};
  datatype = payloadDatatype;
  const priorData = prior as UjOverrideData | null;
  if (priorData === null) return;
  if (priorData.datatype !== datatype) {
    throw new Error("datatype mismatch: " + priorData.datatype);
  }
  initial = priorData.payload;
});

function onData(typedPayload: object) {
  const ujData: UjOverrideData = {
    datatype,
    timestamp: Date.now(),
    payload: typedPayload,
  };
  current.settleOverlay(ujData);
}

</script>

<div class="layer contextmenu" style={styleString}>
  <span class="title"> Picker: {datatype} </span>
  {#if datatype === "color" }
    <PickColors {onData} {initial} />
  {:else if datatype === "coord2d" }
    <PickCoords2D {onData} {initial} />
  {:else if datatype === "text" }
    <PickTexts {onData} {initial} />
  {:else}
    Unsupported data type: {datatype}
  {/if}
</div>

<style>
.layer {
  border-radius: 4px;
  overflow: visible;
  box-shadow: 4px 4px 6px 2px rgba(0, 0, 0, 0.2);
  position: fixed;
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