<script lang="ts">
import type { Edge } from "@xyflow/svelte";
import { onMount } from "svelte";

import { EventKinds } from "../../utils/constants";
import useEventConsumer from "../../utils/useEventConsumer";
import { edgesToPipeline } from "./graph-utils";
import PipelineEditorTabs from "./PipelineEditorTabs.svelte";
import type { PipelineEdge, PipelineStage } from "./types";

const { handleEvent, clearHandlers } = useEventConsumer();

let pipelineStages = $state<PipelineStage[]>([]);
let pipelineLinks = $state<PipelineEdge[]>([]);

onMount(() => {
  // EventKinds
  handleEvent("eee", handleUpdatedEdges);
  return clearHandlers;
});

const stage: PipelineStage = {
  id: "id01",
  label: "Dummy stage",
  inputs: [],
  outputs: [],
};

function handleUpdatedEdges(payload: Edge[]): void {
  const { nodes, edges } = edgesToPipeline(payload);
  pipelineStages = nodes;
  pipelineLinks = edges;
  console.log("pipeline");
}
</script>

<PipelineEditorTabs nodes={pipelineStages} />
