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

import type { base } from "@/types/base";
import type { fn } from "@/types/function";
import type { grph } from "@/types/grph";
import type { xy } from "@/types/xy";
import type { PipelineBuilder } from "@/webworkerclient/PipelineBuilder";

import { registerGraphService, useGraphService } from "../graph-services";

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
  getViewport: _getViewport,
  setViewport: _setViewport,
  screenToFlowPosition: _screenToFlowXY,
} = useSvelteFlow();

const pipeline = getContext(Symbol.for("PipelineBuilder")) as PipelineBuilder;

const rawStoreService = useGraphService("rawStoreService");
const reactiveService = useGraphService("reactiveService");

registerGraphService("flowGraphService", {
  newNodeAt,
  newGraphIOAt,
  validateEdge,
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
  setGraphInput,
  setSlotInput,
  getViewport,
  setViewport,
  // getGraphState,
});

async function newNodeAt(fnSpec: fn.FunctionInfo, position: XYPosition): Promise<void> {
  const { nodeInfo, nodeState, inInfos, outInfos, inoutInfos, inStates, outStates, inoutStates } = await pipeline.createNode({
    func: fnSpec,
  });
  if (!nodeInfo) {
    throw new Error("Node not created");
  }
  const data: xy.xyFuncNodeData = { info: nodeInfo, inInfos, outInfos, inoutInfos};
  const newNode: xy.xyNode = {
    id: nodeInfo.alnumid,
    data,
    type: "function",
    position,
  };

  reactiveService.setNodeState(nodeInfo.rawId, nodeState!);

  const allSlotInfos = [...inInfos, ...outInfos, ...inoutInfos];
  const allSlotStates = [...inStates, ...outStates, ...inoutStates];
  if (allSlotInfos.length !== allSlotStates.length) {
    throw new Error("Slot infos and states length mismatch");
  }
  for (let i = 0; i < allSlotInfos.length; i++) {
    const slotInfo = allSlotInfos[i];
    const slotId: grph.SlotId = {parent: slotInfo.parent, name: slotInfo.name};
    reactiveService.setSlotState(slotId, allSlotStates[i]);
  }

  _updateNodes((nodes: Node[]) => {
    return [...nodes, newNode];
  });
}

async function newGraphIOAt(dtype: string, isOutput: boolean, position: XYPosition): Promise<void> {
  const { nodeInfo, nodeState, slotInfo, slotState } = await pipeline.createIONode({
    dtype,
    isOutput,
  });
  if (!nodeInfo || !slotInfo) {
    throw new Error("Graph IO not created");
  }
  const data: xy.xyGraphIoNodeData = { info: nodeInfo, slotInfo };
  const newNode: xy.xyNode = {
    id: nodeInfo.alnumid,
    data,
    type: "graphio",
    position,
  };

  reactiveService.setNodeState(nodeInfo.rawId, nodeState!);
  const slotId: grph.SlotId = {parent: slotInfo.parent, name: slotInfo.name};
  reactiveService.setSlotState(slotId, slotState!);

  _updateNodes((nodes: Node[]) => {
    return [...nodes, newNode];
  });
}

async function validateEdge(connection: Connection): Promise<grph.SlotValidity> {
  const sourceHandle = connection.sourceHandle!;
  const targetHandle = connection.targetHandle!;
  const sourceSlot = _removeSuffix(sourceHandle, "/out");
  const targetSlot = _removeSuffix(targetHandle, "/in");

  const nodeData0 = _getNode(connection.source)?.data as xy.xyBaseNodeData;
  const nodeData1 = _getNode(connection.target)?.data as xy.xyBaseNodeData;
  if (!nodeData0 || !nodeData1) {
    throw new Error("Source or target node data not found");
  }

  const { validity } = await pipeline.validateEdge({
    sourceNode: nodeData0.info.rawId,
    targetNode: nodeData1.info.rawId,
    sourceSlot,
    targetSlot,
  });
  return validity as grph.SlotValidity;
}

async function addEdge(connection: Connection): Promise<void> {
  const sourceHandle = connection.sourceHandle!;
  const targetHandle = connection.targetHandle!;
  const sourceSlot = _removeSuffix(sourceHandle, "/out");
  const targetSlot = _removeSuffix(targetHandle, "/in");

  const nodeData0 = _getNode(connection.source)?.data as xy.xyBaseNodeData;
  const nodeData1 = _getNode(connection.target)?.data as xy.xyBaseNodeData;
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
  const slotId0: grph.SlotId = {parent: edgeInfo.node0, name: edgeInfo.slot0};
  const slotId1: grph.SlotId = {parent: edgeInfo.node1, name: edgeInfo.slot1};  
  reactiveService.setSlotState(slotId0, sourceState);
  reactiveService.setSlotState(slotId1, targetState);
}

async function deletionHandle(nodes: xy.xyNode[], edges: xy.xyEdge[]): Promise<void> {
  const nodeIds: number[] = nodes.map((n: xy.xyNode) => (n.data as xy.xyBaseNodeData).info.rawId);
  const edgeIds: number[] = edges.map((e: xy.xyEdge) => (e.data as xy.xyEdgeData).info.id);
  const { deletedSlotIds, affectedSlotIds } = await pipeline.deleteElements({
    nodeIds,
    edgeIds,
  });
  reactiveService.deleteSlots(deletedSlotIds);
  const { slotStates } = await pipeline.getSlotStates({
    slotIds: affectedSlotIds,
  });
  for (const [slotId, slotState] of slotStates) {
    reactiveService.setSlotState(slotId, slotState);
  }
}

function screenToFlowXY(input: MouseEvent | base.XYPosition): XYPosition {
  if (input instanceof MouseEvent) {
    return _screenToFlowXY({
      x: input.clientX,
      y: input.clientY,
    } as base.XYPosition);
  } else {
    return _screenToFlowXY(input as base.XYPosition);
  }
}

function allNodes(): xy.xyNode[] {
  return _getNodes() as xy.xyNode[];
}

function allEdges(): xy.xyEdge[] {
  return _getEdges() as xy.xyEdge[];
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

async function setGraphInput(rawNodeId: number, encoded: string): Promise<void> {
  await pipeline.setEncodedData({
    isNode: true,
    nodeId: rawNodeId,
    slotId: null,
    encodedData: { payload: encoded } as grph.EncodedData,
  });
  await _internalUpdateNodeState(rawNodeId);
}

async function setSlotInput(rawNodeId: number, slotName: string, encoded: string): Promise<void> {
  const slotId: grph.SlotId = { parent: rawNodeId, name: slotName };
  await pipeline.setEncodedData({
    isNode: false,
    nodeId: null,
    slotId,
    encodedData: { payload: encoded } as grph.EncodedData,
  });
  await _internalUpdateSlotState(slotId);
}

function getViewport(): xy.Viewport {
  return _getViewport();
}

function setViewport(viewport: xy.Viewport): void {
  _setViewport(viewport);
}

function _getClientXY(event: MouseEvent | TouchEvent): base.XYPosition {
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

async function _internalUpdateNodeState(rawNodeId: number): Promise<void> {
  const { nodeStates } = await pipeline.getNodeStates({ nodeIds: [rawNodeId] });
  for (const [nodeId, nodeState] of nodeStates) {
    reactiveService.setNodeState(nodeId, nodeState);
  }
}

async function _internalUpdateSlotState(slotId: grph.SlotId): Promise<void> {
  const { slotStates } = await pipeline.getSlotStates({ slotIds: [slotId] });
  for (const [slotId, slotState] of slotStates) {
    reactiveService.setSlotState(slotId, slotState);
  }
}
</script>
