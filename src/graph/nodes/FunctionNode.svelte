<script lang="ts">

import { getContext } from "svelte";

import type { xy } from "@/types/xy";
import type { PipelineBuilder } from "@/webworkerclient/PipelineBuilder";

import { EventKinds } from "../../utils/constants";
import useEventDispatch from "../../utils/useEventDispatch";
import { useGraphService } from "../graph-services";
import SlotsArray from "./SlotsArray.svelte";
import useNodeOpsContext from "./useNodeOpsContext";
import XYNodeTopBar from "./XYNodeTopBar.svelte";

const {
  data: nodeData,
  id: nodeId,
  ...restProps
}: xy.xyNodeProps = $props();

/* svelte-ignore state_referenced_locally */
const rawNodeId: number = nodeData.info.rawId;

const pipeline = getContext(Symbol.for("PipelineBuilder")) as PipelineBuilder;
const slotService = useGraphService("slotService");
const dispatchRmNode = useEventDispatch(EventKinds.XY_RM_NODE);

useNodeOpsContext().setNodeOps({
  deleteSelf: () => dispatchRmNode({ nodeId }),
});

const nodeState = slotService.useNodeState(rawNodeId);

</script>

<div class="noderoot">
  <h3 class="card-title">{nodeState.label}</h3>
  <span class="nodeid">{nodeId}</span>
  <SlotsArray {nodeId} {rawNodeId} ins={nodeData.inInfos} outs={nodeData.outInfos} inouts={nodeData.inoutInfos} {slotService} />
</div>
<XYNodeTopBar />

<style>
:global(.svelte-flow .svelte-flow__node) {
  background: var(--color-bg-3);
  border: 1px solid var(--color-bg-4);
}

:global(.svelte-flow .svelte-flow__node.selected) {
  background: rgb(115, 151, 36);
  /* background: linear-gradient(
    to bottom,
    var(--color-accent),
    var(--color-bg-0)
  ); */
}

.noderoot {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.card-title {
  font-weight: 400;
  margin: 0;
}
.card-button {
  font-size: small;
  margin: 0;
}
.nodeid {
  font-size: 0.75rem;
  color: var(--color-text-md-con);
}
</style>
