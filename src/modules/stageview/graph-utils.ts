// utils/graph-utils.ts

import type { Edge } from "@xyflow/svelte";

import type { PipelineEdge, PipelineStage, PipelineVar } from "./types";

/* ============================================================
   Node Lookup
============================================================ */

/**
 * Builds a lookup map for nodes by id.
 *
 * This allows O(1) access to nodes instead of repeatedly
 * scanning the node array.
 *
 * Example:
 *
 * const nodeMap = buildNodeMap(nodes)
 * const node = nodeMap.get("resize")
 *
 * @param nodes List of graph nodes
 * @returns Map keyed by node id
 */
export function buildNodeMap(
  nodes: PipelineStage[],
): Map<string, PipelineStage> {
  const map = new Map<string, PipelineStage>();
  for (const node of nodes) {
    map.set(node.id, node);
  }
  return map;
}

/* ============================================================
   Adjacency Maps
============================================================ */

/**
 * Represents adjacency relationships in the pipeline graph.
 *
 * upstreamMap:
 *   nodeId -> nodes that feed into this node
 *
 * downstreamMap:
 *   nodeId -> nodes that receive output from this node
 *
 * These maps are used for fast neighbor lookups and stage highlighting.
 */
export type Adjacency = {
  upstreamMap: Map<string, Set<string>>;
  downstreamMap: Map<string, Set<string>>;
};

/**
 * Builds adjacency maps for the graph.
 *
 * The result allows fast lookup of direct neighbors
 * without scanning the full edge list repeatedly.
 *
 * Example:
 *
 * A → B → C
 *
 * upstreamMap:
 *   B -> [A]
 *   C -> [B]
 *
 * downstreamMap:
 *   A -> [B]
 *   B -> [C]
 *
 * @param nodes All nodes in the graph
 * @param edges All edges in the graph
 * @returns adjacency maps
 */
export function buildAdjacency(
  nodes: PipelineStage[],
  edges: PipelineEdge[],
): Adjacency {
  const upstreamMap = new Map<string, Set<string>>();
  const downstreamMap = new Map<string, Set<string>>();

  // Initialize maps
  for (const node of nodes) {
    upstreamMap.set(node.id, new Set());
    downstreamMap.set(node.id, new Set());
  }

  // Populate relationships
  for (const edge of edges) {
    if (!upstreamMap.has(edge.target)) upstreamMap.set(edge.target, new Set());
    if (!downstreamMap.has(edge.source))
      downstreamMap.set(edge.source, new Set());

    upstreamMap.get(edge.target)!.add(edge.source);
    downstreamMap.get(edge.source)!.add(edge.target);
  }

  return { upstreamMap, downstreamMap };
}

/* ============================================================
   Neighbor Queries
============================================================ */

/**
 * Returns the direct upstream neighbors of a node.
 *
 * Upstream nodes are those that produce data
 * consumed by the given node.
 *
 * Example:
 *
 * A → B → C
 *
 * getUpstreamNeighbors("B") -> ["A"]
 *
 * @param nodeId Target node id
 * @param adjacency Precomputed adjacency maps
 * @returns list of upstream node ids
 */
export function getUpstreamNeighbors(
  nodeId: string,
  adjacency: Adjacency,
): string[] {
  return Array.from(adjacency.upstreamMap.get(nodeId) ?? []);
}

/**
 * Returns the direct downstream neighbors of a node.
 *
 * Downstream nodes are those that consume outputs
 * produced by the given node.
 *
 * Example:
 *
 * A → B → C
 *
 * getDownstreamNeighbors("B") -> ["C"]
 *
 * @param nodeId Target node id
 * @param adjacency Precomputed adjacency maps
 * @returns list of downstream node ids
 */
export function getDownstreamNeighbors(
  nodeId: string,
  adjacency: Adjacency,
): string[] {
  return Array.from(adjacency.downstreamMap.get(nodeId) ?? []);
}

/* ============================================================
   Topological Sort
============================================================ */

/**
 * Produces a topologically sorted list of nodes.
 *
 * The resulting order ensures that:
 *
 *  - Each node appears AFTER its upstream dependencies
 *  - The pipeline stages can be rendered in execution order
 *
 * This implementation uses **Kahn's algorithm**.
 *
 * Example:
 *
 * Graph:
 *
 *   Load → Resize → Normalize
 *
 * Result:
 *
 *   [Load, Resize, Normalize]
 *
 * If the graph contains a cycle, an error is thrown.
 *
 * @param nodes All nodes in the graph
 * @param edges All edges in the graph
 * @returns nodes ordered by pipeline dependency
 */
export function topologicalSort(
  nodes: PipelineStage[],
  edges: PipelineEdge[],
): PipelineStage[] {
  const nodeMap = buildNodeMap(nodes);

  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, Set<string>>();

  // Initialize structures
  for (const node of nodes) {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, new Set());
  }

  // Compute in-degrees
  for (const edge of edges) {
    adjacency.get(edge.source)?.add(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  // Collect nodes with no dependencies
  const queue: string[] = [];

  for (const [nodeId, degree] of inDegree.entries()) {
    if (degree === 0) queue.push(nodeId);
  }

  const result: PipelineStage[] = [];

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodeMap.get(nodeId);

    if (node) result.push(node);

    for (const neighbor of adjacency.get(nodeId) ?? []) {
      const degree = (inDegree.get(neighbor) ?? 0) - 1;
      inDegree.set(neighbor, degree);

      if (degree === 0) {
        queue.push(neighbor);
      }
    }
  }

  // Detect cycle
  if (result.length !== nodes.length) {
    throw new Error("Cycle detected in pipeline graph");
  }

  return result;
}

/* ============================================================
   Variable Derivation
============================================================ */

/**
 * Internal key used to group edges belonging to the same variable.
 *
 * A variable is uniquely identified by:
 *
 *   sourceNode + sourceHandle
 */
type VariableKey = string;

/**
 * Generates the unique key for a variable based on an edge.
 */
function makeVariableKey(edge: PipelineEdge): VariableKey {
  return `${edge.source}:${edge.sourceHandle}`;
}

/**
 * Derives pipeline variables from graph edges.
 *
 * A variable represents the data produced by a node output
 * and consumed by one or more downstream node inputs.
 *
 * Variables are grouped by:
 *
 *   sourceNode + sourceHandle
 *
 * Example:
 *
 * Resize.image → Normalize.input
 * Resize.image → Preview.input
 *
 * Produces a single variable:
 *
 * {
 *   name: "image"
 *   type: "float3"
 *   producer: Resize.image
 *   consumers:
 *     Normalize.input
 *     Preview.input
 * }
 *
 * @param nodes Graph nodes
 * @param edges Graph edges
 * @returns list of derived variables
 */
export function deriveVariables(
  nodes: PipelineStage[],
  edges: PipelineEdge[],
): PipelineVar[] {
  const nodeMap = buildNodeMap(nodes);

  const variableMap = new Map<VariableKey, PipelineVar>();

  for (const edge of edges) {
    const sourceNode = nodeMap.get(edge.source);
    if (!sourceNode) continue;

    const outputSlot = sourceNode.outputs.find(
      (s) => s.name === edge.sourceHandle,
    );

    const type = outputSlot?.type ?? "unknown";

    const key = makeVariableKey(edge);

    if (!variableMap.has(key)) {
      const name = edge.sourceHandle;

      variableMap.set(key, {
        id: key,
        name,
        type,
        producerNode: edge.source,
        producerHandle: edge.sourceHandle,
        consumers: [],
      });
    }

    variableMap.get(key)!.consumers.push({
      nodeId: edge.target,
      handle: edge.targetHandle,
    });
  }

  return Array.from(variableMap.values());
}

/**
 * Converts XYFlow edge JSON into a stage-based pipeline model.
 *
 * Since the edges contain the node ids and handle names,
 * the node list must be reconstructed by scanning the edges.
 *
 * Each unique `source` or `target` becomes a pipeline stage.
 *
 * Output handles are derived from `sourceHandle`
 * Input handles are derived from `targetHandle`
 *
 * Slot types are unknown unless provided elsewhere.
 */
export function edgesToPipeline(flowEdges: Edge[]) {
  const nodeMap = new Map<string, PipelineStage>();

  function ensureNode(id: string): PipelineStage {
    if (!nodeMap.has(id)) {
      nodeMap.set(id, {
        id,
        label: id,
        inputs: [],
        outputs: [],
      });
    }
    return nodeMap.get(id)!;
  }

  for (const edge of flowEdges) {
    const sourceNode = ensureNode(edge.source);
    const targetNode = ensureNode(edge.target);

    const outName = edge.sourceHandle;
    const inName = edge.targetHandle;

    if (outName && !sourceNode.outputs.some((s) => s.name === outName)) {
      sourceNode.outputs.push({
        name: outName,
        type: "unknown",
      });
    }

    if (inName && !targetNode.inputs.some((s) => s.name === inName)) {
      targetNode.inputs.push({
        name: inName,
        type: "unknown",
      });
    }
  }

  const edges: PipelineEdge[] = flowEdges.map(
    (e: Edge): PipelineEdge => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle as string,
      targetHandle: e.targetHandle as string,
    }),
  );
  const unsortedNodes: PipelineStage[] = Array.from(nodeMap.values());
  const nodes: PipelineStage[] = topologicalSort(unsortedNodes, edges);
  return { nodes, edges };
}
