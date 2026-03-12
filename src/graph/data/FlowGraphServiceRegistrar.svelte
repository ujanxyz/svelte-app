<script lang="ts">
import {
  useEdges,
  useNodes,
  useSvelteFlow,
  type Edge,
  type Node,
} from "@xyflow/svelte";
import { registerGraphService } from "../graph-services";

const { update: updateNodes } = useNodes();
const { update: updateEdges } = useEdges();
const { deleteElements } = useSvelteFlow();

registerGraphService("flowGraphService", {
  deleteNode,
  deleteNodes,
  deleteEdge,
  deleteEdges,
  appendNode,
});

async function deleteNode(nodeId: string): Promise<void> {
  const node = { id: nodeId };
  deleteElements({ nodes: [node], edges: [] });
}

async function deleteNodes(nodeIds: string[]): Promise<void> {
  const nodes = nodeIds.map((id: string) => ({ id }));
  deleteElements({ nodes, edges: [] });
}

async function deleteEdge(edgeId: string): Promise<void> {
  const edge = { id: edgeId };
  deleteElements({ nodes: [], edges: [edge] });
}

async function deleteEdges(edgeIds: string[]): Promise<void> {
  const edges = edgeIds.map((id: string) => ({ id }));
  deleteElements({ nodes: [], edges });
}

async function appendNode(newNode: Node): Promise<void> {
  updateNodes((nodes: Node[]) => {
    return [...nodes, newNode];
  });
}
</script>
