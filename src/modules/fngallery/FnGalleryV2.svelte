<script lang="ts" module>
type Ntype = plinfo.NodeInfo["ntype"];

export interface FnGalleryPayload {
  ntype: Ntype;
}
</script>

<script lang="ts">
import ButtonGroup from "@/components/ButtonGroup.svelte";
import { useOverlayInstance } from "@/modules/overlay2";
import { type fn } from "@/types/function";
import type { plinfo } from "@/types/plinfo";

import FuncTemplatesView from "./FuncTemplatesView.svelte";
import GraphIOTemplatesView from "./GraphIOTemplatesView.svelte";

const overlay = useOverlayInstance<FnGalleryPayload, fn.FunctionInfo | fn.GraphIoInfo>();

const modes: { code: plinfo.NodeInfo["ntype"]; label: string }[] = [
  { code: "FN", label: "Functions" },
  { code: "IN", label: "Graph Inputs" },
  { code: "OUT", label: "Graph Outputs" },
];
let selected = $state<plinfo.NodeInfo["ntype"]>(overlay.payload.ntype);

function closeGallery() {
  overlay.abort();
}

function handleSelectFnType(code: string) {
  // Nothing.
}
</script>

<div class={["shell", "gallery-main"]}>
  <div class="topbar">
    <h2 class="header-l1">www.mockaroo.com</h2>
    <div class="flex-remaining">m</div>
    <input type="text" name="search" class="textfield" value="search" />
    <button aria-label="close" class="iconbtn" onclick={closeGallery}>X</button>
  </div>
  <ButtonGroup buttons={modes} bind:value={selected} onselect={handleSelectFnType} />

  {#if selected === "FN"}
    <FuncTemplatesView />
  {:else if selected === "IN"}
    <GraphIOTemplatesView ntype="IN" />
  {:else if selected === "OUT"}
    <GraphIOTemplatesView ntype="OUT" />
  {/if}
</div>

<style>
.shell {
  position: fixed;
  pointer-events: auto;
  min-width: 160px;
  z-index: 1;
}
.gallery-main {
  width: calc(100vw - 48px);
  height: calc(100vh - 48px);
  max-width: 800px;
  max-height: 1200px;

  margin: 24px auto;
  background-color: #264359;

  display: flex;
  flex-direction: column;
  align-items: stretch;
  border-radius: 12px;
  overflow: hidden;
}
@media (max-width: 1200px) {
  .gallery-main {
    min-width: 600px;
  }
}

.topbar {
  padding: 12px 12px 12px 24px;
  background-color: #303030;

  font-family: "Roboto", sans-serif;
  font-weight: 400;
  line-height: 1.43;
  color: #ffffff;

  display: flex;
  align-items: center;
}

.header-l1 {
  font-size: 1.25rem;
  font-weight: bold;
  line-height: 1.2;
}

.flex-remaining {
  flex: 1 1 0%;
}

.textfield {
  width: 250px;
  height: 32px;
  border-radius: 2px;
  font-size: 1.1rem;
  padding-left: 12px;
}

.iconbtn {
  opacity: 0.5;
  margin-left: 16px;
  border-radius: 50%;
  padding: 2px 8px;
  width: 28px;
  height: 28px;
}
.iconbtn:hover {
  opacity: 1;
  background-color: #7d7373;
}

.contentroot {
  flex: 1 1 0%;
  overflow-y: auto;

  display: flex;
  align-items: stretch;
  flex-direction: column;
}

.gridbox {
  width: 100%;
  max-height: 100%;

  flex: 1;
  align-self: flex-start;

  padding: 18px 12px 12px 12px;

  display: flex;
  justify-content: center;
  align-items: flex-start;
  align-content: flex-start;
  flex-wrap: wrap;
  overflow-y: auto;
  row-gap: 18px;
  column-gap: 12px;
}

.bottombox {
  width: 100%;
  align-items: center;
  white-space: nowrap;
  min-height: 32px;
  background-color: #303030;

  padding: 12px;
}
</style>
