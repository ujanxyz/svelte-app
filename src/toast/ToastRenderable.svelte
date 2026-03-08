<script lang="ts">
import type { Subscriber, Unsubscriber } from "svelte/store";
import { onMount } from "svelte";
import TimedCloseBtn from "../components/TimedCloseBtn.svelte";

interface Props {
  id: string;
  message: string;
  startedAt: number,
  themeColor: string;
  subscribeNow: (fn: Subscriber<number>) => Unsubscriber;
  onexpire: (id: string) => void;
};

const { id, message, startedAt, themeColor, subscribeNow, onexpire }: Props = $props();
let progress = $state<number>(0);
let progressBtn: TimedCloseBtn;

onMount(() => {
  return subscribeNow(_onElapsed);
});

function _onElapsed(timeNow: number): void {
  progress = Math.min((timeNow - startedAt) / 2500.0, 1.0);
  progressBtn.setProgress(progress);
  (progress >= 1.0) && onexpire(id);
}

function onClose(ev: MouseEvent) {
  ev.preventDefault();
  onexpire(id);
}

</script>

<div class="toast" style="--toast-color: {themeColor}">
  <span class="accent"></span>
  <span class="text">{message}</span>
  <TimedCloseBtn bind:this={progressBtn} color={themeColor} iconSize={18} {onClose} />
</div>

<style>
.toast {
  background-color: var(--color-bg-3);
  height: 3rem;

  display: flex;
  flex-direction: row;
  align-items: center;
  column-gap: 8px;
  /* padding: 4px 8px; */
  margin-right: 6px;
  padding-right: 8px;
  border-radius: 4px;
  overflow: hidden;
}
.accent {
  background-color: var(--toast-color);
  align-self: stretch;
  width: 12px;
}
.text {
  flex-grow: 1;
  font-size: 0.875rem;
}
</style>