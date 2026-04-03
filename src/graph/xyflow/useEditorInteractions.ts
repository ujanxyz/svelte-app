import {
  type Connection,
  type Edge,
  type Node,
  type OnConnectStartParams,
} from "@xyflow/svelte";

import type { xy } from "@/types/xy";

import useMemlogging from "../../modules/memlogging/useMemlogging";
import { useGraphService } from "../graph-services";

interface NodesAndEdges {
  nodes: xy.xyNode[];
  edges: xy.xyEdge[];
};

export default function useEditorInteractions() {
  const flowGraphService = useGraphService("flowGraphService");
  const { debugLog, warnLog } = useMemlogging();

  function isValidConnection(edge: Edge | Connection): boolean {
    //console.log("isValidConnection ... ", edge);
    //debugLog("Triggered: isValidConnection");
    return true;
  }

  async function onbeforedelete({nodes, edges}: {nodes: xy.xyNode[], edges: xy.xyEdge[]}): Promise<boolean | NodesAndEdges> {
    flowGraphService.deleteElements(nodes.map(n => n.id as string), edges.map(e => e.id as string));
    // TODO: Check the return and filter nodes and edges.
    return {nodes, edges};
  }

  function onbeforeconnect(connection: Connection): false | xy.xyEdge {
    flowGraphService.addEdge(connection);
    // NOTE: "onbeforeconnect" is not await-ed, so reject this edge and add it
    // manually above. Ref:
    // https://github.com/xyflow/xyflow/issues/5740
    return false;
  }

  function onconnect(connection: Connection): void {
    console.log("onconnect ... ", connection);
    debugLog("Triggered: onconnect");
  }

  function onconnectstart(
    event: MouseEvent | TouchEvent,
    params: OnConnectStartParams,
  ): void {
    console.log("onconnectstart ... ", params);
  }

  function onconnectend(
    event: MouseEvent | TouchEvent,
    connectionState: any,
  ): void {
    console.log("onconnectend ... ", connectionState);
  }

  function onedgeclick({
    edge,
    event,
  }: {
    edge: Edge;
    event: MouseEvent;
  }): void {
    console.log("@ Edge click ... ", edge);
  }

  return {
    isValidConnection,
    onbeforedelete,
    onbeforeconnect,
    onconnect,
    onconnectstart,
    onconnectend,
    onedgeclick,
  };
}
