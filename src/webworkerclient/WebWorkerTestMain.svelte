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
    uri: "/basic/displace-point",
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

async function onDeleteElements() {
  const res = await pipelineBuilder.deleteElements({
    nodeIds: [1],
    edgeIds: [],
  });
  console.log(res);
}

</script>

<div>
  <TextButton text="getGraph" onclick={onGetGraph} />
  <TextButton text="createNode" onclick={onCreateNode} />
  <TextButton text="deleteElements" onclick={onDeleteElements} />
</div>
