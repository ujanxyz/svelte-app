<script lang="ts">
import { onMount } from "svelte";

import type { grph } from "@/types/grph";

import type { NodeContextOps } from "../nodes/nodeContextOps";

interface Props {
  slotInfo: grph.SlotInfo;
  nodeOps: Pick<NodeContextOps, "registerPreview" | "unregisterPreview">;
  onclick: (ev: MouseEvent) => void;
  canvasRef: HTMLCanvasElement | undefined;
}

let { slotInfo, nodeOps, onclick, canvasRef = $bindable() }: Props = $props();

onMount(() => {
  if (!canvasRef || slotInfo.dtype !== "bitmap") return;

  let registrationKey: string | undefined;
  canvasRef.width = 480;
  canvasRef.height = 480;

  nodeOps.registerPreview(slotInfo, canvasRef)
    .then((regKey: string) => {
      registrationKey = regKey;
    })
    .catch((err) => console.error(err));

  return () => {
    if (registrationKey) {
      nodeOps.unregisterPreview(registrationKey).catch((err) => console.error(err));
    }
  };
});
</script>

<button class="preview-button" {onclick} aria-label={`Preview ${slotInfo.name}`}>
  <canvas class="preview-canvas" bind:this={canvasRef}></canvas>
</button>

<style>
.preview-button {
  width: 6rem;
  height: 6rem;
  padding: 0;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  background: var(--color-bg-0);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
}

.preview-button:hover {
  border: 1px solid var(--color-border-default);
}

.preview-button:focus-visible {
  outline: 1px solid var(--color-accent);
  outline-offset: 1px;
}

.preview-canvas {
  width: 6rem;
  aspect-ratio: 1 / 1;
  display: block;
  background: var(--color-bg-1);
}
</style>