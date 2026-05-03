<script lang="ts">
import { getContext } from "svelte";

import type { GraphIoManager } from "@/webworkerclient/GraphIoManager";
import type { PipelineBuilder } from "@/webworkerclient/PipelineBuilder";

import { registerGraphService } from "../graph-services";

const pipeline = getContext(Symbol.for("PipelineBuilder")) as PipelineBuilder;
const io = getContext(Symbol.for("GraphIoManager")) as GraphIoManager;

registerGraphService("pipelineService", _createPipelineService());

function _createPipelineService() {

  async function playPipeline(): Promise<void> {
    console.log("Playing pipeline...");
    const assetInfosResp = await pipeline.buildPipeline({});
    console.log("Pipeline built with assets:", assetInfosResp.assetInfos);

    await pipeline.runPipeline({});
    const resources = await pipeline.getResources({});
    console.log("Resources after run:", resources);
  }

  return {
    playPipeline,
  };
}
</script>