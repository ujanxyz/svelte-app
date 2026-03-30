<script lang="ts">
import { onMount, setContext, type Snippet } from "svelte";

import { type PipelineBuilder } from "@/types/pipeline-builder";

import { usePipelineBuilder } from "./usePipelineBuilder";

interface Props {
  children: Snippet;
};

const { children }: Props = $props();

const pipelineBuilder = usePipelineBuilder();
setContext(Symbol.for("PipelineBuilder"), pipelineBuilder);

onMount(() => {
  console.log(pipelineBuilder);
  return () => {
    pipelineBuilder.destroy();
  };
});
</script>

{@render children()}
