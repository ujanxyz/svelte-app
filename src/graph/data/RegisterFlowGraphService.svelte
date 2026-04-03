<script lang="ts">
import {
  addEdge as flowAddEdge,
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

const {
  current: _currentNodes,
  update: _updateNodes,
  set: _setNodes,
} = useNodes();

const { update: _updateEdges, set: _setEdges } = useEdges();

const {
  deleteElements: _deleteElements,
  getNodes: _getNodes,
  getEdges: _getEdges,
  screenToFlowPosition: _screenToFlowXY,
} = useSvelteFlow();

const pipeline = getContext(Symbol.for("PipelineBuilder")) as PipelineBuilder;

const rawStoreService = useGraphService("rawStoreService");
registerGraphService("flowGraphService", {
  newNodeAt,
  addEdge,
  deleteElements,
  screenToFlowXY,
  allNodes,
  allEdges,
  deleteNode,
  deleteNodes,
  deleteEdge,
  deleteEdges,
  deleteAllEdges,
  deleteGraph,
  assignGraph,
});

async function newNodeAt(fnSpec: fn.FunctionInfo, position: XYPosition): Promise<void> {
  const { nodeInfo, ins, outs, inouts } = await pipeline.createNode({
    func: fnSpec,
  });
  if (!nodeInfo) {
    throw new Error("Node not created");
  }
  console.log(fnSpec, nodeInfo, {ins, outs, inouts});
  const data: xy.xyNodeData = { info: nodeInfo, ins, outs, inouts};
  const newNode: xy.xyNode = {
    id: nodeInfo.alnumid,
    data,
    type: "function",
    position,
  };
  _updateNodes((nodes: Node[]) => {
    return [...nodes, newNode];
  });
}

async function addEdge(connection: Connection): Promise<void> {
  const sourceHandle = connection.sourceHandle!;
  const targetHandle = connection.targetHandle!;
  const sourceSlot = _removeSuffix(sourceHandle, "/out");
  const targetSlot = _removeSuffix(targetHandle, "/in");

  const { edgeInfo } = await pipeline.addEdge({
    sourceNode: connection.source,
    targetNode: connection.target,
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
  rawStoreService.edges = flowAddEdge(edge, rawStoreService.edges);
}

async function deleteElements(nodeIds: string[], edgeIds: string[]): Promise<void> {
  const { nodeIds: deletedNodeIds, edgeIds: deletedEdgeIds } = await pipeline.deleteElements({
    nodeIds,
    edgeIds,
  });
  console.log("pineline deleteElements response: ", deletedNodeIds, deletedEdgeIds);
  // const nodes = deletedNodeIds.map((id: string) => ({ id }));
  // const edges = deletedEdgeIds.map((id: string) => ({ id }));
  // await _deleteElements({ nodes, edges });
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

async function deleteNode(nodeId: string): Promise<void> {
  const node = { id: nodeId };
  await _deleteElements({ nodes: [node], edges: [] });
}

async function deleteNodes(nodeIds: string[]): Promise<void> {
  const nodes = nodeIds.map((id: string) => ({ id }));
  await _deleteElements({ nodes, edges: [] });
}

async function deleteEdge(edgeId: string): Promise<void> {
  const edge = { id: edgeId };
  await _deleteElements({ nodes: [], edges: [edge] });
}

async function deleteEdges(edgeIds: string[]): Promise<void> {
  const edges = edgeIds.map((id: string) => ({ id }));
  await _deleteElements({ nodes: [], edges });
}

async function deleteAllEdges(): Promise<void> {
  _setEdges([]);
}

async function deleteGraph(): Promise<void> {
  console.log("deleteGraph ...");
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
