<script lang="ts">
import { getContext, onMount } from "svelte";

import TextButton from "@/components/TextButton.svelte";
import type { PipelineBuilder } from "@/types/pipeline-builder";
import type { data } from "@/types/pipeline-types";

const pipelineBuilder = getContext(Symbol.for("PipelineBuilder")) as PipelineBuilder;

async function onGetGraph() {
  const res = await pipelineBuilder.getGraph({});
  console.log(res);
}

async function onCreateNode() {
  const func: data.FunctionInfo = {
    uri: "/fn/geom/translate-x",
    label: "Translate Point X",
    desc: "Translate a 2D point along X-axis by a given delta",
    ext: {
      kind: "PURE_FN",
      purefn: {
        ins: [
          { name: "p", dtype: "point2d" },
          { name: "dx", dtype: "float" },
        ],
        outs: [
          { name: "fp", dtype: "point2d" },
        ]
      },
    }
  };
  const res = await pipelineBuilder.createNode({func});
  console.log(res);
}

async function onAddEdges() {
  const entries = [
    {
      node0: "s2GhcWpBLP",
      slot0: "$out:fp",
      node1: "ZBqg1rBrgq",
      slot1: "$in:p",
    },
  ];
  const res = await pipelineBuilder.addEdges({entries});
  console.log(res);
}

</script>

<div>
  <TextButton text="getGraph" onclick={onGetGraph} />
  <TextButton text="createNode" onclick={onCreateNode} />
  <TextButton text="addEdges" onclick={onAddEdges} />
  <TextButton text="deleteElements" onclick={onAddEdges} />
  <TextButton text="clearGraph" onclick={onAddEdges} />
</div>
