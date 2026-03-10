<script lang="ts">
import { onMount } from "svelte";
import type { Node, XYPosition } from "@xyflow/svelte";
import { EventKinds } from "../../utils/constants";
import useEventConsumer from "../../utils/useEventConsumer";
import useGraphOps from "../data/useGraphOps";
import { lookupFnDetailsAsync } from "../../modules/fngallery/apiFunctionInfos";
import { makeNodeCreator } from "../nodes/nodeCreator";

const { handleEvent, handleEventAsync, clearHandlers } = useEventConsumer();
const ops = useGraphOps();
let nextNodeId = 10;
const nodeCreator = makeNodeCreator();

onMount(() => {
  handleEventAsync(EventKinds.FN_GALLERY_SELECT, _xyAddNodeAsync);
  handleEvent(EventKinds.XY_RM_NODE, _xyRmNode);
  handleEvent(EventKinds.XY_RM_EDGE, _xyRmEdge);
  handleEvent(EventKinds.XY_RM_SELECTION, _xyRmSelection);

  return () => clearHandlers();
});

async function _xyAddNodeAsync(payload: { code: string, position: XYPosition }): Promise<void> {
  const funcspec = await lookupFnDetailsAsync(payload.code);
  if (!funcspec) {
    throw new Error("Function not found: " + payload.code);
  }
  const newNode = nodeCreator.newNodFromFunc(funcspec, payload.position);
  console.log(newNode);
  ops.addNode(newNode);
}

function _xyRmNode(payload: { nodeId: string }): void {
  ops.rmNode(payload.nodeId);
}

function _xyRmEdge(payload: { edgeId: string }): void {
  ops.rmEdge(payload.edgeId);
}

function _xyRmSelection(payload: { nodeIds: string[] }): void {
  ops.rmNodes(payload.nodeIds);
}
</script>

<!-- No HTML template, everything via UI registration above -->
