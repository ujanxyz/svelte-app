<script lang="ts">
import { onDestroy, setContext, type Snippet } from "svelte";

import { usePipelineBuilder } from "./usePipelineBuilder";

interface Props {
  children: Snippet;
};

const { children }: Props = $props();

const pipelineBuilder = usePipelineBuilder();
setContext(Symbol.for("PipelineBuilder"), pipelineBuilder);

onDestroy(() => {
  pipelineBuilder.destroy();
});
</script>

{@render children()}
