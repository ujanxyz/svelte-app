<script lang="ts">
import ButtonGroup from "@/components/ButtonGroup.svelte";
import type { PipelineEdge, PipelineStage } from "./types";
import StageViewStages from "./StageViewStages.svelte";

interface Props {
  nodes: PipelineStage[];
}

const { nodes }: Props = $props();

const modes = [
  { code: "stages", label: "Stages" },
  { code: "edges", label: "Connections" },
  { code: "vars", label: "Variables" },
];

let selected = $state<string>("stages");

function handleSelect(code: string) {
  // Nothing.
}
</script>

<div class="container" data-debug-name="pipeline-view">
  <div class="centered">
    <ButtonGroup
      buttons={modes}
      bind:value={selected}
      onselect={handleSelect}
    />
  </div>
  {@render renderChoice(selected)}
</div>

{#snippet renderChoice(code: string)}
  {#if code === "stages"}
    <h2>Stages:</h2>
    <StageViewStages stages={nodes} />
  {:else if code === "edges"}
    TODO: Edges view
  {:else if code === "vars"}
    TODO: Vars view
  {/if}
{/snippet}

<style>
.centered {
  width: 100%;
  text-align: center;
  padding: 12px 16px;
}
</style>
