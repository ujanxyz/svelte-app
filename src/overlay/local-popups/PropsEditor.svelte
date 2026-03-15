<script lang="ts">
import CheckIcon from "phosphor-svelte/lib/CheckIcon";
import { quadOut } from "svelte/easing";
import { fly } from "svelte/transition";

import type { ClientRect } from "../types";
import useCurrentOverlay from "../useCurrentOverlay";

const current = useCurrentOverlay();

let clientRect = $state<ClientRect>({ x: 0, y: 0, w: 0, h: 0 });
let currentText = $state<string>("");

/**
 * CSS vars controlling the menu position.
 */
const containerStyle: string = $derived(
  `--client-x: ${clientRect.x}px; --client-y: ${clientRect.y}px; --client-w: ${clientRect.w}px; --client-h: ${clientRect.h}px;`,
);

$effect.pre(() => {
  const { anchor, lorem } = current.getLayerPayload();
  currentText = lorem;
  const rect = (anchor as HTMLDivElement).getBoundingClientRect();
  clientRect.x = rect.left;
  clientRect.y = rect.top;
  clientRect.w = rect.width;
  clientRect.h = rect.height;
});

function onClickApply() {
  const editedLorem = $state.snapshot(currentText);
  current.settleOverlay({ editedLorem });
}
</script>

<div class="container" style={containerStyle}>
  <div
    class="toastcard"
    transition:fly={{ y: clientRect.w, duration: 300, easing: quadOut }}
  >
    <div class="topbar">
      <span class="title">Edit</span>
      <button class="actionbtn" onclick={onClickApply}>
        <CheckIcon size={24} />
      </button>
    </div>
    <div class="content">
      <textarea class="editor" bind:value={currentText}></textarea>
    </div>
  </div>
</div>

<style>
.container {
  left: var(--client-x);
  top: var(--client-y);
  width: var(--client-w);
  height: var(--client-h);
  position: fixed;
  overflow: hidden;
}
.toastcard {
  background-color: rgb(82, 82, 82);
  border-radius: 6px;
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.topbar {
  height: 2.4rem;
  padding: 8px;
  background-color: rgb(0, 0, 0, 40%);
  padding: 2px 8px;
  display: flex;
  align-items: center;
}

.content {
  flex-grow: 1;
  background-color: rgba(210, 210, 210, 0.7);
  color: rgba(0, 0, 0, 0.8);
}
.title {
  flex-grow: 1;
  font-weight: 600;
  white-space: nowrap;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 8px;
}
.actionbtn {
  background-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border-radius: 50%;
  height: calc(24px + 8px);
  width: calc(24px + 8px);
  padding: 4px;
  cursor: pointer;
}

.editor {
  --spacing: 12px;
  width: calc(100% - 2 * var(--spacing));
  height: calc(100% - 2 * var(--spacing));
  margin: var(--spacing);
  padding: 4px;
  border-radius: 6px;
  background-color: #eaeaea;
  color: #202020;
  border: 1px solid #484848;

  line-height: 1;
  font-size: 0.8rem;
  font-family: monospace;
}
</style>
