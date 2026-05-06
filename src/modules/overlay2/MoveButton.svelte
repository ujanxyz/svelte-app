<script lang="ts">
import { onMount } from "svelte";

import { getAppIcon } from "@/utils/appIcons";

import { useOverlayInstance } from "./useOverlayInstance";

interface Props {
  size: number;
}

const { size }: Props = $props();

const overlay = useOverlayInstance<unknown, unknown>();

let containerBtn: HTMLButtonElement;
let capturedPtrId: number | undefined;
let dragStartClient: { x: number; y: number } | null = null;
let currentTranslate = { dx: 0, dy: 0 };
let startTranslate = { dx: 0, dy: 0 };

function onPointerDown(ev: PointerEvent) {
  ev.preventDefault();
  capturedPtrId = ev.pointerId;
  containerBtn.setPointerCapture(ev.pointerId);
  dragStartClient = { x: ev.clientX, y: ev.clientY };
  startTranslate = { ...currentTranslate };
}

function onPointerUp(ev: PointerEvent) {
  if (!dragStartClient) return;
  ev.preventDefault();
  containerBtn?.releasePointerCapture(ev.pointerId);
  dragStartClient = null;
}

function onPointerMove(ev: PointerEvent) {
  if (!dragStartClient) return;
  ev.preventDefault();
  currentTranslate = {
    dx: startTranslate.dx + ev.clientX - dragStartClient.x,
    dy: startTranslate.dy + ev.clientY - dragStartClient.y,
  };
  overlay.setTranslate(currentTranslate.dx, currentTranslate.dy);
}

function onClick(ev: MouseEvent) {
  ev.preventDefault();
}

const MoveIcon = getAppIcon("dots-six");

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
  style:width={`${size}px`}
  style:height={`${size}px`}
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
  onpointerup={onPointerUp}
  onpointercancel={onPointerUp}
  onclick={onClick}
  data-kind="move-handle"
>
  <MoveIcon {size}/>
</button>

<style>
.dragbtn {
  color: #ffffff;
  background-color: transparent;
  margin: 0 8px;
  cursor: grab;
  user-select: none;
}

.dragbtn:active {
  cursor: grabbing;
}
</style>
