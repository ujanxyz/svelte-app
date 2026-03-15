<script lang="ts">
import { useEdges, useNodes } from "@xyflow/svelte";

import useAppLocalData from "@/modules/persistence/useAppLocalData";

import { useGraphService } from "../graph-services";
import type { UjGraphStorage } from "../types";
import { initialEdges, initialNodes } from "../xyflow/nodes-and-edges";

const ioService = useGraphService("ioService");
const flowGraphService = useGraphService("flowGraphService");

let localDataOps: ReturnType<typeof useAppLocalData<UjGraphStorage>>;

if (import.meta.env.VITE_FLAG_ENABLE_LOCAL_STORAGE === "true") {
  localDataOps = useAppLocalData<UjGraphStorage>(
    "graph",
    (): UjGraphStorage | null => {
      const nodes = flowGraphService.allNodes();
      const edges = flowGraphService.allEdges();
      if (nodes.length === 0) return null;
      const graph = ioService.serializeObject(nodes, edges);
      return graph;
    },
  );
}

const nodesStore = useNodes();
const edgesStore = useEdges();

$effect.pre(() => {
  if (currentGraphSize() > 0) {
    // Graph not empty, do not populate.
    return;
  }
  if (import.meta.env.VITE_FLAG_ENABLE_LOCAL_STORAGE === "true") {
    if (tryPopulateFromLocalStorage()) return;
  }
  if (import.meta.env.DEV) {
    if (tryPopulateFromFixedData()) return;
  }
  // Empty graph to build from scratch.
});

$effect(() => {
  if (import.meta.env.VITE_FLAG_ENABLE_LOCAL_STORAGE === "true") {
    nodesStore.current;
    edgesStore.current;
    localDataOps!.signalUpdate();
  }
});


/**
 * @requires import.meta.env.VITE_FLAG_ENABLE_LOCAL_STORAGE
 */
function tryPopulateFromLocalStorage(): boolean {
  const loadedData = localDataOps.getLoadedData();
  if (loadedData === null) return false;
  const { nodes, edges } = loadedData;
  flowGraphService.populateGraph(nodes, edges);
  return currentGraphSize() > 0;
}

function tryPopulateFromFixedData(): boolean {
  flowGraphService.populateGraph(initialNodes, initialEdges);
  return currentGraphSize() > 0;
}

function currentGraphSize(): number {
  return (
    flowGraphService.allNodes().length + flowGraphService.allEdges().length
  );
}
</script>
