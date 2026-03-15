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
  populateGraph,
});

function screenToFlowXY(event: MouseEvent): XYPosition {
  return _screenToFlowXY({
    x: event.clientX,
    y: event.clientY,
  } as ClientXY);
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

function populateGraph(newNodes: Node[], newEdges: Edge[]): void {
  console.log("populateGraph ---", newNodes.length, newEdges.length);
  const newNodeIds: string[] = newNodes.map((n: Node) => n.id);
  const newEdgeIds: string[] = newEdges.map((e: Edge) => e.id);

  const priorNodes = _getNodes(newNodeIds);
  const priorEdges = _getEdges(newEdgeIds);
  if (priorNodes.length > 0 || priorEdges.length > 0) {
    // Graph not empty, do not populate.
    console.warn("Node / edge id coflict, skip populating graph");
    return;
  }
  _updateNodes((nodes: Node[]) => {
    return [...nodes, ...newNodes];
  });
  _updateEdges((edges: Edge[]) => {
    return [...edges, ...newEdges];
  });
}
</script>
