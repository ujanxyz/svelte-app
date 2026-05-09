<script lang="ts">

import NodeHeader from "@/graph/components/NodeHeader.svelte";
import type { plstate } from "@/types/plstate";
import type { xy } from "@/types/xy";

import { setNodeContextOps } from "./nodeContextOps";
import SlotsArray from "./SlotsArray.svelte";
import XYNodeTopBar, { type ActionHandler } from "./XYNodeTopBar.svelte";

const {
  data: baseNodeData,
  id: nodeId,
  ...restProps
}: xy.xyNodeProps = $props();

/* svelte-ignore state_referenced_locally */
const funcNodeData = baseNodeData as xy.xyFuncNodeData;

/* svelte-ignore state_referenced_locally */
const rawNodeId: number = funcNodeData.info.rawId;

/* svelte-ignore state_referenced_locally */
const nodeOps = setNodeContextOps(funcNodeData.info);

const nodeState = $derived(nodeOps.reactiveNodeState()) as plstate.NodeState;

const actionHandler: ActionHandler = {
  onSelfInput: async function (): Promise<void> {},

  onDeleteSelf: async function (): Promise<void> {
    nodeOps.onDeleteSelf();
  }
};

</script>

<div class="node-shell">
  <NodeHeader label={`${rawNodeId} / ${nodeState.label}`} {nodeId} />
  <SlotsArray ins={funcNodeData.inInfos} outs={funcNodeData.outInfos} inouts={funcNodeData.inoutInfos} />
</div>
<XYNodeTopBar ntype={funcNodeData.info.ntype} {actionHandler} />

<style>
.node-shell {
  display: flex;
  flex-direction: column;
}
</style>
