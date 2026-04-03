<script lang="ts">
import { getContext } from "svelte";

import TextButton from "@/components/TextButton.svelte";
import type { fn } from "@/types/function";

import type { PipelineBuilder } from "./PipelineBuilder";

const pipelineBuilder = getContext(Symbol.for("PipelineBuilder")) as PipelineBuilder;

async function onGetGraph() {
  const res = await pipelineBuilder.getGraph({});
  console.log(res);
}

async function onCreateNode() {
  const func: fn.FunctionInfo = {
    uri: "/fn/geom/translate-x",
    label: "Translate Point X",
    desc: "Translate a 2D point along X-axis by a given delta",
    params: [
      { name: "p", dtype: "point2d", access: "I" },
      { name: "dx", dtype: "float", access: "I" },
      { name: "fp", dtype: "point2d", access: "O" },
    ],
  };
  const res = await pipelineBuilder.createNode({func});
  console.log(res);
}

async function onAddEdges() {
  const res = await pipelineBuilder.addEdge({
    sourceNode: "s2GhcWpBLP",
    sourceSlot: "fp",
    targetNode: "ZBqg1rBrgq",
    targetSlot: "p",
  });
  console.log(res);
}

async function onDeleteElements() {
  const res = await pipelineBuilder.deleteElements({
    nodeIds: ["s2GhcWpBLP"],
    edgeIds: [],
  });
  console.log(res);
}

</script>

<div>
  <TextButton text="getGraph" onclick={onGetGraph} />
  <TextButton text="createNode" onclick={onCreateNode} />
  <TextButton text="addEdges" onclick={onAddEdges} />
  <TextButton text="deleteElements" onclick={onDeleteElements} />
  <TextButton text="clearGraph" onclick={onAddEdges} />
</div>
