<script lang="ts">
import StageRow from "./StageRow.svelte";
import type { PipelineEdge, PipelineStage } from "./types";

interface Props {
  nodes: PipelineStage[];
  edges: PipelineEdge[];
}

const { nodes, edges }: Props = $props();

let selectedStageId = $state<string | null>(null);

function selectStage(id: string) {
  selectedStageId = id;
}

/* simple neighbor highlighting for dummy example */

function isUpstream(index: number) {
  return nodes[index + 1]?.id === selectedStageId;
}

function isDownstream(index: number) {
  return nodes[index - 1]?.id === selectedStageId;
}
</script>

<div class="stage-view">
  <div class="title">Pipeline Stages</div>
  <div class="scrollable">
    {#each nodes as stage, i (stage.id)}
      <StageRow
        {stage}
        selected={stage.id === selectedStageId}
        upstream={isUpstream(i)}
        downstream={isDownstream(i)}
        onSelect={selectStage}
      />

      {#if i < nodes.length - 1}
        <div class="arrow">↓</div>
      {/if}
    {/each}
  </div>
</div>

<style>
.stage-view {
}

.scrollable {
  background-color: darkblue;
  display: flex;
  padding: 12px;
  flex-direction: column;
  min-height: 100%;

  align-items: stretch;

  overflow-x: visible;
  overflow-y: scroll;
}

.title {
  font-weight: 700;
  margin-bottom: 8px;
}

.arrow {
  text-align: center;
  color: #aaa;
  font-size: 18px;
  margin: 2px 0;
}
</style>
