<script lang="ts">
import {
  type Edge,
  type Node,
  useEdges,
  useNodes,
  useSvelteFlow,
  type XYPosition,
} from "@xyflow/svelte";

import type { ClientXY } from "@/overlay/types";

import { registerGraphService } from "../graph-services";

const { current: _currentNodes, update: _updateNodes, set: _setNodes } = useNodes();

const { update: _updateEdges, set: _setEdges } = useEdges();

const {
  deleteElements: _deleteElements,
  getNodes: _getNodes,
  getEdges: _getEdges,
  screenToFlowPosition: _screenToFlowXY,
} = useSvelteFlow();

registerGraphService("flowGraphService", {
  screenToFlowXY,
  allNodes,
  allEdges,
  deleteNode,
  deleteNodes,
  deleteEdge,
  deleteEdges,
  deleteAllEdges,
  deleteGraph,
  appendNode,
  assignGraph,
});

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

async function appendNode(newNode: Node): Promise<void> {
  const existingIds = new Set<string>(_getNodes().map((n: Node) => n.id));
    if (existingIds.has(newNode.id)) {
      throw new Error("Node id conflict at append");
    }
  _updateNodes((nodes: Node[]) => {
    return [...nodes, newNode];
  });
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
</script>
