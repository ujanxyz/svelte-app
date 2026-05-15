<script module lang="ts">
const FADE_DELAY_MS = 1500;
</script>

<script lang="ts">
import { onMount, type Snippet } from "svelte";

interface Props {
  children: Snippet;
  className?: string;
}

let {
  children,
  className = "",
}: Props = $props();

let panelEl: HTMLDivElement | null = null;
let isActive = $state(false);
let fadeTimer: ReturnType<typeof setTimeout> | null = null;

function clearFadeTimer(): void {
  if (fadeTimer !== null) {
    clearTimeout(fadeTimer);
    fadeTimer = null;
  }
}

function scheduleHide(): void {
  clearFadeTimer();
  fadeTimer = setTimeout(() => {
    isActive = false;
  }, FADE_DELAY_MS);
}

function activateForAWhile(): void {
  isActive = true;
  scheduleHide();
}

onMount(() => {
  if (!panelEl?.parentElement) {
    return;
  }

  const parent = panelEl.parentElement;

  const onPointerMove = (ev: PointerEvent): void => {
    const rect = parent.getBoundingClientRect();
    const inside =
      ev.clientX >= rect.left &&
      ev.clientX <= rect.right &&
      ev.clientY >= rect.top &&
      ev.clientY <= rect.bottom;

    if (inside) {
      activateForAWhile();
    }
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });

  return () => {
    clearFadeTimer();
    window.removeEventListener("pointermove", onPointerMove);
  };
});
</script>

<div
  bind:this={panelEl}
  class={["fading-panel", className, isActive && "fading-panel-active"]}
>
  {@render children()}
</div>

<style>
.fading-panel {
  transition: opacity 0.45s ease;
  opacity: 0;
}

.fading-panel.fading-panel-active {
  opacity: 1;
}
</style>
