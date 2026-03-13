<script lang="ts">
import StageListRow from "./StageListRow.svelte";
import { type PipelineStage } from "./types";
import ArrowDownIcon from "phosphor-svelte/lib/ArrowDownIcon";

interface Props {
  stages: PipelineStage[];
}

const { stages }: Props = $props();

let selectedStageId = $state<string | null>(null);

function selectStage(id: string) {
  selectedStageId = id;
}

/* simple neighbor highlighting for dummy example */

function isUpstream(index: number) {
  return stages[index + 1]?.id === selectedStageId;
}

function isDownstream(index: number) {
  return stages[index - 1]?.id === selectedStageId;
}
</script>

<div class="stages">
  {#each stages as stage, i (stage.id)}
    {#if i > 0}
      <div class="arrow"><ArrowDownIcon /></div>
    {/if}
    <StageListRow
      {stage}
      selected={stage.id === selectedStageId}
      upstream={isUpstream(i)}
      downstream={isDownstream(i)}
      onSelect={selectStage}
    />
  {/each}
</div>

<style>
.stages {
  height: 100%;
  padding: 4px;

  display: flex;
  flex-direction: column;
  align-items: stretch;

  overflow-x: hidden;
  overflow-y: scroll;
  scrollbar-width: none;
}

.stages:focus-within {
  scrollbar-width: thin;
}

.title {
  font-weight: 700;
  margin-bottom: 8px;
}

.arrow {
  text-align: center;
  color: #aaa;
  margin: 1px 0;
}
</style>
