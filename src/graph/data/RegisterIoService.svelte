<script lang="ts">
import {
  type Edge,
  type Node,
  type Viewport,
} from "@xyflow/svelte";

import { registerGraphService } from "../graph-services";
import { type UjGraphStorage, type UjNodeData } from "../types";

type UjNode = UjGraphStorage["nodes"][number];
type UjEdge = UjGraphStorage["edges"][number];

registerGraphService("ioService", {
  serializeObject,
});

function serializeObject(
  nodes: Node[],
  edges: Edge[],
  viewport: Viewport,
): UjGraphStorage {
  const ujnodes: UjNode[] = nodes.map((n: Node): UjNode => {
    return {
      id: n.id,
      data: n.data as UjNodeData,
      position: n.position,
    };
  });
  const ujedges: UjEdge[] = edges.map((e: Edge): UjEdge => {
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle as string,
      targetHandle: e.targetHandle as string,
    };
  });
  const graph: UjGraphStorage = {
    nodes: ujnodes,
    edges: ujedges,
    viewport,
  };
  return graph;
}

</script>
