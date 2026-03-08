<script lang="ts">
import ButtonGroup from "../components/ButtonGroup.svelte";
import TimedCloseBtn from "../components/TimedCloseBtn.svelte";
import ToastTestermain from "../toast/ToastTesterMain.svelte";
import ContextMenuMain from "./context-menu/ContextMenuMain.svelte";
import LocalPopupsMain from "./local-popups/LocalPopupsMain.svelte";
import RecursiveCardsMain from "./recursive-cards/RecursiveCardsMain.svelte";

const modes = [
	 { code: "recursive", label: "Recursive Cards" },
	 { code: "ctxmenu", label: "Context Menu" },
	 { code: "local", label: "Localized Sliders"  },
   { code: "toast", label: "Toast" },
];

let selected = $state<string>("toast");

function handleSelect(code: string) {
  // Nothing.
}

</script>

<div class="centered">
  <ButtonGroup buttons={modes} bind:value={selected} onselect={handleSelect} />
</div>
<div class="content">
  {#if selected === "recursive" }
    <RecursiveCardsMain />
  {:else if selected === "ctxmenu" }
    <ContextMenuMain />
  {:else if selected === "local" }
    <LocalPopupsMain />
  {:else if selected === "toast" }
    <ToastTestermain />
  {:else}
    No component to show.
  {/if}
</div>

<style>
.centered {
  width: 100%;
  text-align: center;
  margin-top: 10px;
  margin-bottom: 48px;
  padding: 12px 16px;
}
.content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
