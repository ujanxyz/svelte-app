<script lang="ts">
import { SvelteFlowProvider } from "@xyflow/svelte";
import FlowGraph from "./FlowGraph.svelte";
import { provideGraphContext } from "../graph-services";
import { type Snippet } from "svelte";

interface Props {
  atBeforeFlow?: Snippet;
  atAfterFlow?: Snippet;
}

const { atBeforeFlow, atAfterFlow }: Props = $props();

provideGraphContext();
</script>

<SvelteFlowProvider>
  {#if atBeforeFlow}
    {@render atBeforeFlow()}
  {/if}
  <FlowGraph />
  {#if atAfterFlow}
    {@render atAfterFlow()}
  {/if}
</SvelteFlowProvider>
