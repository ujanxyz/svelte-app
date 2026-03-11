<script lang="ts">
import { SvelteFlowProvider } from "@xyflow/svelte";
import FlowGraph from "./FlowGraph.svelte";
import ObserveConnection from "./ObserveConnection.svelte";
import { provideGraphContext } from "../graph-services";
import { setContext, type Snippet } from "svelte";

interface Props {
  atBeforeFlow?: Snippet;
  atAfterFlow?: Snippet;
}

const { atBeforeFlow, atAfterFlow }: Props = $props();

provideGraphContext();

// TODO: Deprecate this.
// const graph = new GraphService();
// setContext(GraphService.CONTEXT_KEY, graph);
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
