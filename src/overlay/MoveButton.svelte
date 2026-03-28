<script lang="ts">
import { onMount, type Snippet } from "svelte";

import useCurrentOverlay from "./useCurrentOverlay";

interface Props {
  children: Snippet;
  width: number;
  height: number;
}

const { children, width, height }: Props = $props();

const overlay = useCurrentOverlay();
let containerBtn: HTMLButtonElement;
let capturedPtrId: number | undefined;
let dragOffset: { x: number; y: number } | null = null;

function onPointerDown(ev: PointerEvent) {
  ev.preventDefault();
  ev.stopPropagation();
  capturedPtrId = ev.pointerId;
  containerBtn.setPointerCapture(ev.pointerId);
  const { dx: priorDx, dy: priorDy } = overlay.getTranslate();
  dragOffset = { x: ev.clientX - priorDx, y: ev.clientY - priorDy };
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
  };
});
</script>

<button
  bind:this={containerBtn}
  class="dragbtn"
  style:width={`${width}px`}
  style:height={`${height}px`}
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
  onpointerup={onPointerUp}
  onclick={onClick}
  data-kind="move-handle"
>
  {@render children()}
</button>

<style>
.dragbtn {
  --line-color: #ffffff;
  background-color: transparent;
  margin: 0 8px;
  cursor: grab;
  user-select: none;
}
</style>
