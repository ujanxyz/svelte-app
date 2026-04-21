<script lang="ts">

import type { xy } from "@/types/xy";

import { useGraphService } from "../graph-services";
import { setNodeContextOps } from "./nodeContextOps";
import SlotsArray from "./SlotsArray.svelte";
import XYNodeTopBar from "./XYNodeTopBar.svelte";

const {
  data: baseNodeData,
  id: nodeId,
  ...restProps
}: xy.xyNodeProps = $props();

/* svelte-ignore state_referenced_locally */
const funcNodeData = baseNodeData as xy.xyFuncNodeData;

/* svelte-ignore state_referenced_locally */
const rawNodeId: number = funcNodeData.info.rawId;

const slotService = useGraphService("slotService");
const flowService = useGraphService("flowGraphService");

/* svelte-ignore state_referenced_locally */
setNodeContextOps(nodeId, rawNodeId, flowService);

const nodeState = slotService.useNodeState(rawNodeId);
console.log(nodeState);

</script>

<div class="noderoot">
  <h3 class="card-title">{rawNodeId} / {nodeState.label}</h3>
  <span class="nodeid">{nodeId}</span>
</div>
<SlotsArray {nodeId} {rawNodeId} ins={funcNodeData.inInfos} outs={funcNodeData.outInfos} inouts={funcNodeData.inoutInfos} {slotService} />
<XYNodeTopBar ntype="FN" {rawNodeId} />

<style>
:global(.svelte-flow .svelte-flow__node) {
  background: var(--color-bg-3);
  border: 1px solid var(--color-bg-4);
}

:global(.svelte-flow .svelte-flow__node.selected) {
  background: rgb(28, 116, 145);
  /* background: linear-gradient(
    to bottom,
    var(--color-accent),
    var(--color-bg-0)
  ); */
}

.noderoot {
  padding: 0 6px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  /* background-color: rgb(68, 100, 100); */
}
.card-title {
  font-weight: 400;
  font-size: 0.55rem;
  margin: 0;
}
.nodeid {
  font-size: 0.385rem;
  color: var(--color-text-lo-con);
  margin-bottom: 4px;
}
.card-button {
  font-size: small;
  margin: 0;
}
</style>
