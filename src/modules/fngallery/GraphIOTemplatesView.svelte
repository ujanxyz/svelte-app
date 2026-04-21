<script lang="ts">
import TextButton from "@/components/TextButton.svelte";
import useCurrentOverlay from "@/overlay/useCurrentOverlay";
import type { fn } from "@/types/function";
import type { plinfo } from "@/types/plinfo";

type Ntype = plinfo.NodeInfo["ntype"];
const overlay = useCurrentOverlay();

interface Props {
  ntype: Ntype;
}
const { ntype }: Props = $props();

function onSelect(dtype: string) {
  console.log("Selected dtype: " + dtype);
  const ioInfo: fn.GraphIoInfo = {
    dtype,
    uri: (ntype === "IN" ? "/$IN/" : "/$OUT/") + dtype,
  };
  overlay.settleOverlay(ioInfo);
}
</script>

<div>
  {"Graph IO templates for " + ntype}
  <p>
    <TextButton text={"dtype: float32"} onclick={() => onSelect("float")} />
  </p>
  <p>
    <TextButton text={"dtype: Point2D"} onclick={() => onSelect("point2d")} />
  </p>
  <p>
    <TextButton text={"dtype: Bitmap"} onclick={() => onSelect("bitmap")} />
  </p>
</div>