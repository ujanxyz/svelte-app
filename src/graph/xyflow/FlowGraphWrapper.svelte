<script lang="ts">
import { SvelteFlowProvider } from "@xyflow/svelte";
import { type Snippet } from "svelte";

import { provideGraphContext } from "../graph-services";
import FlowGraph from "./FlowGraph.svelte";

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
