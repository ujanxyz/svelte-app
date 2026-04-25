<script lang="ts">
import { onDestroy, setContext, type Snippet } from "svelte";

import { useWebWorkerResources } from "./useWebWorkerResources";

interface Props {
  children: Snippet;
};

const { children }: Props = $props();

const { pipeline, graphIo, destroyWorker } = useWebWorkerResources();

setContext(Symbol.for("PipelineBuilder"), pipeline);
setContext(Symbol.for("GraphIoManager"), graphIo);
onDestroy(destroyWorker);
</script>

{@render children()}
