<script lang="ts">
import SlotsArray from "./SlotsArray.svelte";
import { onDestroy, onMount } from "svelte";
import { type Node, type NodeProps } from "@xyflow/svelte";
import useNodeOpsContext from "./useNodeOpsContext";
import useEventDispatch from "../../utils/useEventDispatch";
import { EventKinds } from "../../utils/constants";
import XYNodeTopBar from "./XYNodeTopBar.svelte";
import type { NodeDetailsData } from "./types";

const {
  data: nodeDetails,
  id: nodeId,
  ...restProps
}: NodeProps<Node<NodeDetailsData>> = $props();

let containerDiv: HTMLDivElement | undefined;
const slots = {
  ins: ["x1", "x2"],
  outs: ["y1", "y2"],
  ios: ["m1"],
};

const dispatchRmNode = useEventDispatch(EventKinds.XY_RM_NODE);

useNodeOpsContext().setNodeOps({
  deleteSelf: () => dispatchRmNode({ nodeId }),
});

onMount(() => {});

onDestroy(() => {
  containerDiv = undefined;
});
</script>

<div bind:this={containerDiv} class="noderoot">
  <h3 class="card-title">{nodeDetails.label}</h3>
  <span class="nodeid">{nodeId}</span>
  <!-- <a href="#" class="card-button">View</a> -->
  <SlotsArray
    ins={nodeDetails.ins}
    outs={nodeDetails.outs}
    inouts={nodeDetails.inouts}
  />
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
  font-size: 0.5rem;
  color: var(--color-text-md-con);
}
</style>
