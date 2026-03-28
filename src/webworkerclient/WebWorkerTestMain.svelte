<script lang="ts">
import { onMount } from "svelte";

import TextButton from "@/components/TextButton.svelte";

import { useWebWorker } from "./useWebWorker";

const { remoteBuilder } = useWebWorker();

onMount(() => {
  console.log(remoteBuilder);
});

async function onGetGraph() {
  const res = await remoteBuilder.getGraph({});
  console.log(res);
}

async function onCreateNode() {
  const specs = {
        "spec": {
            "kind": "lam",
            "label": "Noise",
            "description": "Generates noise",
            "data_type": "float",
            "arg_types": ["vec2"],
            "inputs": [
                { "name": "seed", "data_type": "int" }
            ]
        }
    };
  const jsonspec = JSON.stringify(specs);
  const res = await remoteBuilder.createNode(jsonspec);
  console.log(res);
}

async function onAddEdges() {
  const entries = [
    {
      node0: "s2GhcWpBLP",
      slot0: "$out",
      node1: "ZBqg1rBrgq",
      slot1: "$in:seed",
    },
  ];
  const res = await remoteBuilder.addEdges({entries});
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
