<script lang="ts">
import {
  addEdge as _addEdge,
  type Connection,
  type Edge,
  type Node,
  useEdges,
  useNodes,
  useSvelteFlow,
  type XYPosition,
} from "@xyflow/svelte";
import { getContext } from "svelte";

import type { ClientXY } from "@/overlay/types";
import type { fn } from "@/types/function";
import type { xy } from "@/types/xy";
import type { PipelineBuilder } from "@/webworkerclient/PipelineBuilder";

import { registerGraphService, useGraphService } from "../graph-services";
import type { plstate } from "@/types/plstate";
import type { plinfo } from "@/types/plinfo";

const {
  current: _currentNodes,
  update: _updateNodes,
  set: _setNodes,
} = useNodes();

const { update: _updateEdges, set: _setEdges } = useEdges();

const {
  deleteElements: _deleteElements,
  getNode: _getNode,
  getNodes: _getNodes,
  getEdges: _getEdges,
  screenToFlowPosition: _screenToFlowXY,
} = useSvelteFlow();

const pipeline = getContext(Symbol.for("PipelineBuilder")) as PipelineBuilder;

const rawStoreService = useGraphService("rawStoreService");
const slotService = useGraphService("slotService");

registerGraphService("flowGraphService", {
  newNodeAt,
  addEdge,
  deletionHandle,
  screenToFlowXY,
  allNodes,
  allEdges,
  deleteNodes,
  deleteEdges,
  deleteAllEdges,
  deleteGraph,
  assignGraph,
});

async function newNodeAt(fnSpec: fn.FunctionInfo, position: XYPosition): Promise<void> {
  const { nodeInfo, inInfos, outInfos, inoutInfos, inStates, outStates, inoutStates } = await pipeline.createNode({
    func: fnSpec,
  });
  if (!nodeInfo) {
    throw new Error("Node not created");
  }
  const data: xy.xyNodeData = { info: nodeInfo, inInfos, outInfos, inoutInfos};
  const newNode: xy.xyNode = {
    id: nodeInfo.alnumid,
    data,
    type: "function",
    position,
  };

  const nodeState: plstate.NodeState = {
    label: nodeInfo.fnuri,
    connected: "WAIT",
    genId: -1,
  };
  slotService.setNodeState(nodeInfo.rawId, nodeState);

  const allSlotInfos = [...inInfos, ...outInfos, ...inoutInfos];
  const allSlotStates = [...inStates, ...outStates, ...inoutStates];
  if (allSlotInfos.length !== allSlotStates.length) {
    throw new Error("Slot infos and states length mismatch");
  }
  for (let i = 0; i < allSlotInfos.length; i++) {
    const slotInfo = allSlotInfos[i];
    const slotId: plinfo.SlotId = {parent: slotInfo.parent, name: slotInfo.name};
    slotService.setSlotState(slotId, allSlotStates[i]);
  }

  _updateNodes((nodes: Node[]) => {
    return [...nodes, newNode];
  });
}

async function addEdge(connection: Connection): Promise<void> {
  const sourceHandle = connection.sourceHandle!;
  const targetHandle = connection.targetHandle!;
  const sourceSlot = _removeSuffix(sourceHandle, "/out");
  const targetSlot = _removeSuffix(targetHandle, "/in");

  const nodeData0 = _getNode(connection.source)?.data as xy.xyNodeData;
  const nodeData1 = _getNode(connection.target)?.data as xy.xyNodeData;
  if (!nodeData0 || !nodeData1) {
    throw new Error("Source or target node data not found");
  }

  const { edgeInfo, sourceState, targetState } = await pipeline.addEdge({
    sourceNode: nodeData0.info.rawId,
    targetNode: nodeData1.info.rawId,
    sourceSlot,
    targetSlot,
  });
  const data: xy.xyEdgeData = { info: edgeInfo };
  const edge: xy.xyEdge = {
    source: connection.source,
    target: connection.target,
    sourceHandle,
    targetHandle,
    id: edgeInfo.catid,
    type: "default",
    data,
  };
  rawStoreService.edges = _addEdge(edge, rawStoreService.edges);
  slotService.testUpdate();
  const slotId0: plinfo.SlotId = {parent: edgeInfo.node0, name: edgeInfo.slot0};
  const slotId1: plinfo.SlotId = {parent: edgeInfo.node1, name: edgeInfo.slot1};  
  slotService.setSlotState(slotId0, sourceState);
  slotService.setSlotState(slotId1, targetState);
}

async function deletionHandle(nodes: xy.xyNode[], edges: xy.xyEdge[]): Promise<void> {
  const nodeIds: number[] = nodes.map((n: xy.xyNode) => (n.data as xy.xyNodeData).info.rawId);
  const edgeIds: number[] = edges.map((e: xy.xyEdge) => (e.data as xy.xyEdgeData).info.id);
  const { deletedSlotIds, affectedSlotIds } = await pipeline.deleteElements({
    nodeIds,
    edgeIds,
  });
  slotService.deleteSlots(deletedSlotIds);
  const { slotStates } = await pipeline.getSlotStates({
    slotIds: affectedSlotIds,
  });
  for (const [slotId, slotState] of slotStates) {
    slotService.setSlotState(slotId, slotState);
  }
}

function screenToFlowXY(input: MouseEvent | ClientXY): XYPosition {
  if (input instanceof MouseEvent) {
    return _screenToFlowXY({
      x: input.clientX,
      y: input.clientY,
    } as ClientXY);
  } else {
    return _screenToFlowXY(input as ClientXY);
  }
}

function allNodes(): Node[] {
  return _getNodes();
}

function allEdges(): Edge[] {
  return _getEdges();
}

async function deleteNodes(nodeIds: string[]): Promise<void> {
  const nodes = nodeIds.map((id: string) => ({ id }));
  await _deleteElements({ nodes, edges: [] });
}

async function deleteEdges(edgeIds: string[]): Promise<void> {
  const edges = edgeIds.map((id: string) => ({ id }));
  await _deleteElements({ nodes: [], edges });
}

async function deleteAllEdges(): Promise<void> {
  _setEdges([]);
}

async function deleteGraph(): Promise<void> {
  _setEdges([]);
  _setNodes([]);
}

function assignGraph(newNodes: Node[], newEdges: Edge[]): void {
  _setEdges([]);
  _setNodes(newNodes);
  _setEdges(newEdges);
}

function _getClientXY(event: MouseEvent | TouchEvent): ClientXY {
  if (event instanceof MouseEvent) {
    return { x: event.clientX, y: event.clientY };
  } else {
    const touch = event.touches[0] ?? event.changedTouches[0];
    return { x: touch.clientX, y: touch.clientY };
  }
}

function _removeSuffix(text: string, suffix: string): string {
  if (text.endsWith(suffix)) {
    return text.slice(0, -suffix.length);
  }
  return text;
}
</script>
