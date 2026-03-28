<script lang="ts">
import ArrowsOutCardinalIcon from "phosphor-svelte/lib/ArrowsOutCardinalIcon";
import XIcon from "phosphor-svelte/lib/XIcon";
import { quadOut } from "svelte/easing";
import { fly } from "svelte/transition";

import ButtonGroup from "@/components/ButtonGroup.svelte";
import MoveButton from "@/overlay/MoveButton.svelte";
import type { ClientRect } from "@/overlay/types";
import useCurrentOverlay from "@/overlay/useCurrentOverlay";

import SlotsDataTable from "./SlotsDataTable.svelte";

const overlay = useCurrentOverlay();

let clientRect = $state.raw<ClientRect>({ x: 200, y: 300, w: 400, h: 400 });

/**
 * CSS vars controlling the menu position.
 */
const containerStyle: string = $derived(
  `--client-x: ${clientRect.x}px; --client-y: ${clientRect.y}px; --client-w: ${clientRect.w}px; --client-h: ${clientRect.h}px;`,
);

const modes = [
  { code: "slots", label: "Slots" },
  { code: "nodes", label: "Nodes" },
  { code: "edges", label: "Edges" },
  { code: "vars", label: "Vars" },
];

let selected = $state<string>("slots");

function onClickClose() {
  overlay.abortOverlay();
}
</script>

<div class="container" style={containerStyle}>
  <div
    class="toastcard"
    transition:fly={{ y: clientRect.w, duration: 300, easing: quadOut }}
  >
    <div class="topbar">
      <span class="title">Edit</span>
      <MoveButton width={24} height={24}>
        <ArrowsOutCardinalIcon size={24} color="#FFFFFF" />
      </MoveButton>
      <button class="actionbtn" onclick={onClickClose}>
        <XIcon size={24} color="#FFFFFF" />
      </button>
    </div>
    <div style:flex-grow={1}>
      <ButtonGroup buttons={modes} bind:value={selected} />
      <div class="content">
        {#if selected === "slots"}
          <SlotsDataTable />
        {:else if selected === "nodes"}
          Nodes view
        {:else if selected === "edges"}
          Edges view
        {:else if selected === "vars"}
          Vars view
        {:else}
          No component to show.
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
.container {
  /* left: var(--client-x);
  top: var(--client-y);
  width: var(--client-w);
  height: var(--client-h); */
  position: fixed;
  overflow: hidden;
  resize: both;
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
  color: #ffffff;
  height: 2.4rem;
  padding: 8px;
  background-color: rgb(0, 0, 0, 40%);
  padding: 2px 8px;
  display: flex;
  align-items: center;
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
  border-radius: 50%;
  height: calc(24px + 8px);
  width: calc(24px + 8px);
  padding: 4px;
  cursor: pointer;
}

.content {
  margin: var(--spacing);
  min-height: 400px;
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
