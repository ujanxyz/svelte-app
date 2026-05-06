<script lang="ts">
import TextButton from "@/components/TextButton.svelte";
import { useOverlayInstance } from "@/modules/overlay2";
import type { fn } from "@/types/function";
import type { plinfo } from "@/types/plinfo";

type Ntype = plinfo.NodeInfo["ntype"];
const overlay = useOverlayInstance<unknown, fn.FunctionInfo | fn.GraphIoInfo>();

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
  overlay.settle(ioInfo);
}
</script>

<div>
  {"Graph IO templates for " + ntype}
  <p>
    <TextButton text={"dtype: float32"} onclick={() => onSelect("floats")} />
  </p>
  <p>
    <TextButton text={"dtype: Point2D"} onclick={() => onSelect("points2d")} />
  </p>
  <p>
    <TextButton text={"dtype: Bitmap"} onclick={() => onSelect("bitmap")} />
  </p>
  <p>
    <TextButton text={"dtype: Colors"} onclick={() => onSelect("colors")} />
  </p>
</div>