<script lang="ts">
import { useEdges, useNodes, type Edge, type Node } from "@xyflow/svelte";
import { registerGraphService } from "../graph-services";

const { update: updateNodes } = useNodes();
const { update: updateEdges } = useEdges();

registerGraphService("flowGraphService", {
  deleteNode,
  deleteNodes,
  deleteEdge,
  appendNode,
});

async function deleteNode(nodeId: string): Promise<void> {
  console.log("In deleteNode @ flowGraphService .. ", nodeId);
  updateNodes((nodes: Node[]) => {
    console.log("Inside delete ... len: ", nodes.length);
    return nodes.filter((n: Node) => n.id !== nodeId);
  });
}

async function deleteNodes(nodeIds: string[]): Promise<void> {
  const lookup = new Set<string>(nodeIds);
  updateNodes((nodes: Node[]) => {
    return nodes.filter((n: Node) => !lookup.has(n.id));
  });
}

async function deleteEdge(edgeId: string): Promise<void> {
  updateEdges((edges: Edge[]): Edge[] => {
    return edges.filter((e: Edge) => e.id !== edgeId);
  });
}

async function appendNode(newNode: Node): Promise<void> {
  updateNodes((nodes: Node[]) => {
    return [...nodes, newNode];
  });
}
</script>
