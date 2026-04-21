<script lang="ts">
import { getContext, onMount } from "svelte";

import useCurrentOverlay from "@/overlay/useCurrentOverlay";
import type { fn } from "@/types/function";
import type { PipelineBuilder } from "@/webworkerclient/PipelineBuilder";

import { fetchFnInfos } from "./apiFunctionInfos";
import FunctionCard from "./FunctionCard.svelte";

const pipeline = getContext(Symbol.for("PipelineBuilder")) as PipelineBuilder;
const { fetchItemsAsync, abortFetch } = fetchFnInfos(pipeline);
const overlay = useCurrentOverlay();

let itemsPromise = $state(fetchItemsAsync());

onMount(() => {
  return () => abortFetch();
});

function onSelect(spec: fn.FunctionInfo) {
  overlay.settleOverlay(spec);
}
</script>

  {#await itemsPromise}
    <p>Loading...</p>
  {:then items}
    <div class="contentroot">
      <div class="gridbox">
        {#each items as item}
          <FunctionCard spec={item} {onSelect} />
        {/each}
      </div>
      <div class="bottombox">Bottom box.</div>
    </div>
  {:catch err}
    <p style="color:red;">
      {err.name === "AbortError" ? "Request cancelled." : err.message}
    </p>
  {/await}

<style>
.elevated-rounded-md {
  border-radius: 4px;
  box-shadow:
    0px 11px 15px -7px rgba(var(--box-shadow-rgb), 0.2),
    0px 24px 38px 3px rgba(var(--box-shadow-rgb), 0.14),
    0px 9px 46px 8px rgba(var(--box-shadow-rgb), 0.12);
}

.contentroot {
  flex: 1 1 0%;
  overflow-y: auto;

  display: flex;
  align-items: stretch;
  flex-direction: column;
}

.gridbox {
  width: 100%;
  max-height: 100%;

  flex: 1;
  align-self: flex-start;

  padding: 18px 12px 12px 12px;

  display: flex;
  justify-content: center;
  align-items: flex-start;
  align-content: flex-start;
  flex-wrap: wrap;
  overflow-y: auto;
  row-gap: 18px;
  column-gap: 12px;
}

.bottombox {
  width: 100%;
  align-items: center;
  white-space: nowrap;
  min-height: 32px;
  background-color: #303030;

  padding: 12px;
}
</style>