<script lang="ts">
import { onMount } from "svelte";

import { useGraphService } from "../graph-services";

const flowGraphService = useGraphService("flowGraphService");
const pipelineService = useGraphService("pipelineService");

const LOCAL_STORAGE_ENABLED = import.meta.env.VITE_FLAG_ENABLE_LOCAL_STORAGE === "true";
const AUTOSAVE_ENABLED = import.meta.env.VITE_FLAG_ENABLE_LOCAL_STORAGE_AUTOSAVE === "true";
const AUTOSAVE_MS = 10_000;

let autosaveTimer: ReturnType<typeof setInterval> | null = null;

onMount(() => {
  void _initializeGraph();

  if (LOCAL_STORAGE_ENABLED && AUTOSAVE_ENABLED) {
    autosaveTimer = setInterval(() => {
      void pipelineService.saveGraphToLocalStorage();
    }, AUTOSAVE_MS);
  }

  return () => {
    if (autosaveTimer !== null) {
      clearInterval(autosaveTimer);
      autosaveTimer = null;
    }
  };
});

async function _initializeGraph(): Promise<void> {
  if (_currentGraphSize() > 0) {
    // The current graph allready has ome data, likely from hot module
    // replacement during development, or UI switching.
    // In this case, we should not override it with any persisted graph data,
    // to avoid disrupting the developer's workflow.
    return;
  }
  if (LOCAL_STORAGE_ENABLED) {
    await pipelineService.restoreGraphFromLocalStorage();
  }
}

function _currentGraphSize(): number {
  return flowGraphService.allNodes().length + flowGraphService.allEdges().length;
}
</script>
