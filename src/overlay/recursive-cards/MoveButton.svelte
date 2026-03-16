<script lang="ts">
import { onMount } from "svelte";

import useCurrentOverlay from "../useCurrentOverlay";

interface Props {
  width: number;
  height: number;
  debugTitle: string;
}

const { width, height, debugTitle }: Props = $props();

const overlay = useCurrentOverlay();
let containerBtn: HTMLButtonElement;
let capturedPtrId: number | undefined;
let dragOffset: {x: number, y: number} | null = null;

function onPointerDown(ev: PointerEvent) {
  ev.preventDefault();
  ev.stopPropagation();
  capturedPtrId = ev.pointerId;
  containerBtn.setPointerCapture(ev.pointerId);
  const {dx: priorDx, dy: priorDy } = overlay.getTranslate();
  dragOffset = {x: ev.clientX - priorDx, y: ev.clientY - priorDy};
}

function onPointerUp(ev: PointerEvent) {
  if (!dragOffset) return;
  ev.preventDefault();
  containerBtn?.releasePointerCapture(ev.pointerId);
  dragOffset = null;
}

function onPointerMove(ev: PointerEvent) {
  if (!dragOffset) return;
  ev.preventDefault();
  overlay.setTranslate(ev.clientX - dragOffset.x, ev.clientY - dragOffset.y);
}

function onClick(ev: MouseEvent) {
  console.log("Mouse clicked on the button ...");
  ev.preventDefault();
  ev.stopPropagation();
}

onMount(() => {
  return () => {
    if (capturedPtrId) {
      containerBtn?.releasePointerCapture(capturedPtrId);
    }
  }
});
</script>

<button bind:this={containerBtn}
    class="dragbtn"
    style:width={`${width}px`}
    style:height={`${height}px`}
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onclick={onClick}
    data-kind="move-handle"
    >
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}">
    <defs>
      <!-- Define a cross-hatch pattern -->
      <pattern id="crossHatch" class="hatch" patternUnits="userSpaceOnUse" width="10" height="10">
        <circle cx="5" cy="5" r="2" />
      </pattern>
    </defs>
  <rect x="0" y="0" width="{width}" height="{height}" fill="url(#crossHatch)" stroke="none" />
  </svg>
</button>

<style>
.dragbtn {
  --line-color: #FFFFFF;
  background-color: transparent;
  margin: 0 8px;
  cursor: grab;
  user-select: none;
}
.hatch {
  stroke: var(--line-color);
  stroke-width: 0.5;
  fill: none;
}
</style>