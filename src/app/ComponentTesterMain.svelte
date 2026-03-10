<script lang="ts">
import ButtonGroup from "../components/ButtonGroup.svelte";
import ContextMenuMain from "../overlayv2/context-menu/ContextMenuMain.svelte";
import LocalPopupsMain from "../overlayv2/local-popups/LocalPopupsMain.svelte";
import RecursiveCardsMain from "../overlayv2/recursive-cards/RecursiveCardsMain.svelte";
import XYFlowWrapper from "../graph/xyflow/XYFlowWrapper.svelte";
import ScreenLayout from "./ScreenLayout.svelte";
import ToastTesterMain from "../modules/toast/ToastTesterMain.svelte";
import MemLogTesterMain from "../memlogging/MemLogTesterMain.svelte";

const modes = [
  { code: "recursive", label: "Cards" },
  { code: "ctxmenu", label: "Ctx Menu" },
  { code: "local", label: "Local Edits" },
  { code: "graph", label: "Graph" },
  // { code: "screen", label: "Screen" },
  { code: "toast", label: "Toast" },
  { code: "memlog", label: "Mem-logging" },
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
    <XYFlowWrapper />
  {:else if selected === "screen"}
    <ScreenLayout />
  {:else if selected === "toast"}
    <ToastTesterMain />
  {:else if selected === "memlog"}
    <MemLogTesterMain />
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
