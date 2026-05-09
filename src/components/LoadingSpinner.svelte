<script lang="ts">
import { onMount } from "svelte";

import { getAppIcon } from "@/utils/appIcons";

interface Props {
  iconSize?: number;
  stepDeg?: number;
  intervalMs?: number;
}

const {
  iconSize = 32,
  stepDeg = 8,
  intervalMs = 16,
}: Props = $props();

const SpinnerIcon = getAppIcon("circle-notch");

let angleDeg = $state<number>(0);
let timerId: ReturnType<typeof setInterval> | null = null;

onMount(() => {
  timerId = setInterval(() => {
    angleDeg = ((angleDeg + stepDeg) | 0) % 360;
  }, intervalMs);

  return () => {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  };
});
</script>

<div class="spinner-shell" aria-label="Loading">
  <span
    class="spinner-icon"
    style:transform={`rotate(${angleDeg}deg)`}
  >
    <SpinnerIcon size={iconSize} weight="bold" aria-hidden="true" />
  </span>
</div>

<style>
.spinner-shell {
  width: 10rem;
  height: 10rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  background: var(--color-bg-4);
  color: var(--color-text-hi-con);
}

.spinner-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}
</style>