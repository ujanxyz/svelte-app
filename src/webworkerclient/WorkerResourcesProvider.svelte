<script lang="ts">
import { onDestroy, setContext, type Snippet } from "svelte";

import { FlowWorkerApi } from "./FlowWorkerApi";
import { GraphWorkerApi } from "./GraphWorkerApi";
import { IoWorkerApi } from "./IoWorkerApi";
import { useWebWorkerResources } from "./useWebWorkerResources";

interface Props {
  children: Snippet;
};

const { children }: Props = $props();

const { flow, graph, io, destroyWorker } = useWebWorkerResources();

setContext(FlowWorkerApi.CONTEXT_KEY, flow);
setContext(GraphWorkerApi.CONTEXT_KEY, graph);
setContext(IoWorkerApi.CONTEXT_KEY, io);
onDestroy(destroyWorker);
</script>

{@render children()}
