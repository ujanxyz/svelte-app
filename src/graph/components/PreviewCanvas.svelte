<script lang="ts">
import { onMount } from "svelte";

import FadingPanel from "@/components/FadingPanel.svelte";
import type { grph } from "@/types/grph";
import { getAppIcon } from "@/utils/appIcons";

import type { NodeContextOps } from "../nodes/nodeContextOps";

const IconEdit = getAppIcon("note-pencil");

interface Props {
  slotInfo: grph.SlotInfo;
  nodeOps: Pick<NodeContextOps, "registerPreview" | "unregisterPreview">;
  onZoomClick: () => void;
  onEditClick: () => void;
  canvasRef: HTMLCanvasElement | undefined;
}

let { slotInfo, nodeOps, onZoomClick, onEditClick, canvasRef = $bindable() }: Props = $props();

function handleZoomClick(ev: MouseEvent): void {
  ev.stopPropagation();
  onZoomClick();
}

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

<div class="preview-shell" role="group" aria-label={`Preview surface for ${slotInfo.name}`}>
  <button class="preview-button" onclick={handleZoomClick} aria-label={`Preview ${slotInfo.name}`}>
    <canvas class="preview-canvas" bind:this={canvasRef}></canvas>
  </button>

  {#if slotInfo.dtype === "bitmap" && slotInfo.access === "O"}
    <FadingPanel className="preview-canvas-fading-panel">
      <div role="toolbar" aria-label="Preview actions">
        <button class="preview-open-btn" type="button" onclick={onEditClick} aria-label={`Edit ${slotInfo.name}`}>
          <IconEdit size={14} weight="bold" aria-hidden="true" />
        </button>
      </div>
    </FadingPanel>
  {/if}
</div>

<style>
.preview-shell {
  width: 6rem;
  height: 6rem;
  position: relative;
}

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

/* Use :global because this class is applied on FadingPanel's root DOM, not this component's scoped DOM. */
:global(.preview-canvas-fading-panel) {
  position: absolute;
  inset: 0;
  top: var(--space-2);
  left: var(--space-2);
  pointer-events: none;
}

.preview-open-btn {
  width: calc(var(--space-6) * 2);
  height: calc(var(--space-6) * 2);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-full);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-hi-con);
  background: color-mix(in srgb, var(--color-bg-0) 70%, transparent);
  backdrop-filter: var(--backdrop-filter);
  -webkit-backdrop-filter: var(--backdrop-filter);
  box-shadow: 0 2px 10px color-mix(in srgb, var(--color-flip-bg-0) 45%, transparent);
  cursor: pointer;
  pointer-events: auto;
}

.preview-open-btn:hover {
  border-color: var(--color-border-strong);
  background: color-mix(in srgb, var(--color-bg-0) 85%, transparent);
}

.preview-open-btn:focus-visible {
  outline: 1px solid var(--color-accent);
  outline-offset: 1px;
}
</style>