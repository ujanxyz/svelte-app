<script lang="ts">
import { type Edge, type Node, type Viewport, type XYPosition } from "@xyflow/svelte";

import type { FuncParam, FuncSpec } from "@/modules/fngallery/types";
import { createIdGenerator } from "@/utils/idGenerator";

import { registerGraphService } from "../graph-services";
import { type UjGraphStorage, type UjNodeData } from "../types";

type UjNode = UjGraphStorage["nodes"][number];
type UjEdge = UjGraphStorage["edges"][number];

const nodeIdGen = createIdGenerator(12);

registerGraphService("ioService", {
  createNodeAt,
  serializeObject,
});

function createNodeAt(fnSpec: FuncSpec, position: XYPosition): Node {
  const nodeId: string = nodeIdGen();
  const { ins, outs, inouts } = _makeParams(fnSpec.params);
  const details: UjNodeData = {
    label: fnSpec.label,
    funcid: fnSpec.id,
    _funspec: fnSpec,
    ins,
    outs,
    inouts,
  };
  return {
    id: nodeId,
    data: details,
    type: "default",
    position,
  } as Node;
}

function serializeObject(nodes: Node[], edges: Edge[], viewport: Viewport): UjGraphStorage {
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

function _makeParams(params: FuncParam[]) {
  const ins: UjNodeData["ins"] = [];
  const outs: UjNodeData["outs"] = [];
  const inouts: UjNodeData["inouts"] = [];
  for (const p of params) {
    const { name, type } = p;
    switch (p.access) {
      case "i":
        ins.push({ name, type });
        break;
      case "o":
        outs.push({ name, type });
        break;
      case "m":
        inouts.push({ name, type });
        break;
    }
  }
  return { ins, outs, inouts };
}
</script>
