<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

import { createOverlayManager, OverlayRoot } from "@/modules/overlay2";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: Snippet;
  bgcolor?: string;
}

const { children, bgcolor, ...rest }: Props = $props();
const overlayManager = createOverlayManager();
</script>

<OverlayRoot manager={overlayManager}>
  In pregress:
  <div
    class={["container"]}
    style:background-color={bgcolor}
    {...rest}
    data-debug-name="centered-in-overlay"
  >
    {@render children()}
  </div>
</OverlayRoot>

<style>
.container {
  width: 100%;
  height: 100%;
  text-align: center;
  vertical-align: middle;
  border: 1px dashed #484848;
}
</style>
