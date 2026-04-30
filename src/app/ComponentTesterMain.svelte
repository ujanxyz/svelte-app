<script lang="ts">
import WebWorkerTestMain from "@/webworkerclient/WebWorkerTestMain.svelte";

import ButtonGroup from "../components/ButtonGroup.svelte";
import GraphEditorWithRealOps from "../graph/GraphEditorWithRealOps.svelte";
import MemLogTesterMain from "../modules/memlogging/MemLogTesterMain.svelte";
import StageViewMain from "../modules/stageview/StageViewMain.svelte";
import ToastTesterMain from "../modules/toast/ToastTesterMain.svelte";
import ContextMenuMain from "../overlay/context-menu/ContextMenuMain.svelte";
import LocalPopupsMain from "../overlay/local-popups/LocalPopupsMain.svelte";
import RecursiveCardsMain from "../overlay/recursive-cards/RecursiveCardsMain.svelte";
import ScreenLayout from "./ScreenLayout.svelte";
import PickFile from "@/modules/sloteditor/PickFile.svelte";
import OverlayV2Tester from "@/app/OverlayV2Tester.svelte";
import StyleDemosMain from "@/modules/styledemos/StyleDemosMain.svelte";

const modes = [
  { code: "recursive", label: "Cards" },
  { code: "ctxmenu", label: "Ctx Menu" },
  { code: "local", label: "Masonry" },
  { code: "graph", label: "Graph" },
  { code: "stage", label: "Stage" },
  // { code: "screen", label: "Screen" },
  { code: "toast", label: "Toast" },
  { code: "memlog", label: "Mem-logging" },
  { code: "worker", label: "WebWorker" },
  { code: "upload", label: "File Upload" },
  { code: "styles", label: "Styles" },
  { code: "overlayv2", label: "Overlay V2" },
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
  {:else if selected === "local"}
    <LocalPopupsMain />
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
  {:else if selected === "overlayv2"}
    <OverlayV2Tester />
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
