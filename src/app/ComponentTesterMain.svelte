<script lang="ts">
import ContextMenuMain from "@/demos/ContextMenuMain.svelte";
import MasonryGridMain from "@/demos/masonry-grid/MasonryGridMain.svelte";
import StyleDemosMain from "@/demos/style-tokens/StyleDemosMain.svelte";
import PickFile from "@/modules/sloteditor/PickFile.svelte";
import WebWorkerTestMain from "@/webworkerclient/WebWorkerTestMain.svelte";

import ButtonGroup from "../components/ButtonGroup.svelte";
import RecursiveCardsMain from "../demos/recursive-cards/RecursiveCardsMain.svelte";
import GraphEditorWithRealOps from "../graph/GraphEditorWithRealOps.svelte";
import MemLogTesterMain from "../modules/memlogging/MemLogTesterMain.svelte";
import StageViewMain from "../modules/stageview/StageViewMain.svelte";
import ToastTesterMain from "../modules/toast/ToastTesterMain.svelte";
import ScreenLayout from "./ScreenLayout.svelte";

const modes = [
  { code: "recursive", label: "Cards" },
  { code: "ctxmenu", label: "Ctx Menu" },
  { code: "masonry", label: "Masonry" },
  { code: "graph", label: "Graph" },
  { code: "stage", label: "Stage" },
  // { code: "screen", label: "Screen" },
  { code: "toast", label: "Toast" },
  { code: "memlog", label: "Mem-logging" },
  { code: "worker", label: "WebWorker" },
  { code: "upload", label: "File Upload" },
  { code: "styles", label: "Styles" },
];

let selected = $state<string>("graph");

function handleSelect(code: string) {
  // Nothing.
}
</script>

<div class="centered">
  <span style="font-size: 1.2rem;">Component testing:</span>
  &nbsp;&nbsp;
  <ButtonGroup buttons={modes} bind:value={selected} onselect={handleSelect} />
</div>
<div class="content">
  {#if selected === "recursive"}
    <RecursiveCardsMain />
  {:else if selected === "ctxmenu"}
    <ContextMenuMain />
  {:else if selected === "masonry"}
    <MasonryGridMain />
  {:else if selected === "graph"}
    <GraphEditorWithRealOps />
  {:else if selected === "stage"}
    <GraphEditorWithRealOps />
    <StageViewMain />
  {:else if selected === "screen"}
    <ScreenLayout />
  {:else if selected === "toast"}
    <ToastTesterMain />
  {:else if selected === "memlog"}
    <MemLogTesterMain />
  {:else if selected === "worker"}
    <WebWorkerTestMain />
  {:else if selected === "upload"}
    <PickFile />
  {:else if selected === "styles"}
    <StyleDemosMain />
  {:else}
    No component to show.
  {/if}
</div>

<style>
.centered {
  width: 100%;
  text-align: center;
  margin: auto;
  padding: 12px 16px;
}
.content {
  width: 90%;
  max-width: 1194px;
  height: 90%;
  max-height: 1400px;
  margin: auto;
  border-radius: 8px;
  background-color: var(--color-bg-1);
  border: 1px solid var(--color-border-subtle);

  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
