import { getContext, setContext } from "svelte";

import type { GraphServices } from "../graph-services";

const CONTEXT_KEY = Symbol("nodeCtx");

function makeNodeContextOps(nodeId: string, rawNodeId: number, flowService: GraphServices["flowGraphService"]) {
  async function onDeleteSelf(): Promise<void> {
    await flowService!.deleteNodes([nodeId]);
  }

  async function onSelfInput(encoded: string): Promise<void> {
    await flowService!.setGraphInput(rawNodeId, encoded);
  }

  return { onDeleteSelf, onSelfInput };
}

type NodeContextOps = ReturnType<typeof makeNodeContextOps>;

function setNodeContextOps(nodeId: string, rawNodeId: number, flowService: GraphServices["flowGraphService"]): void {
  const nodeOps = makeNodeContextOps(nodeId, rawNodeId, flowService);
  setContext(CONTEXT_KEY, nodeOps);
}

function getNodeContextOps(): NodeContextOps {
  return getContext(CONTEXT_KEY) as NodeContextOps;
}

export { getNodeContextOps, setNodeContextOps };
