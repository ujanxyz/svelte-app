<script lang="ts">
import { getContext, type Snippet } from "svelte";
import type { CellData } from "./types";
import type { StatusOr } from "../types";

interface Props {
  cellData: CellData;
  cellIcon: Snippet;
}

const { cellData, cellIcon }: Props = $props();
/* svelte-ignore state_referenced_locally */
const { weightY, bgcolor, title, lorem } = cellData;

let currentLorem = $state<string>(lorem);

let container: HTMLDivElement;

type EditAsyncFn = (anchor: HTMLDivElement, initial: string) => Promise<string | null>;
const propsEditor = getContext("propseditor") as { editPropsAsync: EditAsyncFn };

async function openLocalPopup(ev: MouseEvent) {
  ev.preventDefault();
  const snapshotLorem: string = $state.snapshot(currentLorem);
  const editedStr = await propsEditor.editPropsAsync(container, snapshotLorem) as string | null;
  if (!!editedStr) {
    currentLorem = editedStr;
  }
}
</script>

<div style="--cell-height:{weightY}; --cell-color:{bgcolor}" class="cell">
  <div class="cardbody" bind:this={container}>
    <div class="topbar">
      <span class="title" {title}>{title}</span>
      <button class="actionbtn" onclick={openLocalPopup}>
        {@render cellIcon()}
      </button>
    </div>
    <div class="content">
      <span class="subtext">{currentLorem}</span>
    </div>
  </div>
</div>

<style>
.cell {
  flex-grow: var(--cell-height);
  padding-bottom: var(--cell-spacing);
}
.cell:last-child {
  padding-bottom: 0;
}

.cardbody {
  background-color: var(--cell-color);
  border-radius: var(--cell-corner-radius);
  overflow: hidden;
  color: #f0f0f0;
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
  padding: 4px 8px;
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
  max-width: 10rem;
  padding-right: 8px;
}

.actionbtn {
  background-color: rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
  border-radius: 50%;
  height: calc(24px + 8px);
  width: calc(24px + 8px);
  padding: 4px;
  cursor: pointer;
}
.subtext {
  line-height: 1;
  font-size: 0.85rem;
  font-weight: 400;
}
</style>
