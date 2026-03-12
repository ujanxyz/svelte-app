<script lang="ts">
import { onMount } from "svelte";
import StageView from "./StageView.svelte";
import type { PipelineEdge, PipelineStage } from "./types";
import useEventConsumer from "../../utils/useEventConsumer";
import { EventKinds } from "../../utils/constants";
import type { Edge } from "@xyflow/svelte";
import { edgesToPipeline } from "./graph-utils";

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

<!-- <div style="display: none;">
  <pre>
Implement a Svelte component (using Svelte-5 runes) having two different one above another:

Stages view: to show a list view of information on the stages of a pipeline.
Each stage comes from a node in the execution graph. In the original graph a node had input and output slots, so each stage
has input and output params. When one stage is selected, its upstream and downstream stages are also highlighted with different colors.

Data view: Entries for each variable used in the pipeline. Each variable corresponds to an edge in the graph, which is emitted
by the source node's handle and consumed by the destination node's incoming handle. This view provides a meaningful
monitor of all variables in one place.

The whole component which has these two views, is reactive to the graph's list of nodes and edge connections.
It subscribes to a store that provides that information about the current structure about the graph.

Think in dept, ask questions, suggest improvements, and then give a high level implementationn plan. Don't yet write code.
  </pre>
</div> -->

<StageView nodes={pipelineStages} edges={pipelineLinks} />
