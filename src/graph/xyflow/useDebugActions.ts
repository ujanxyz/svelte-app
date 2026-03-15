import {
  type Connection,
  type Edge,
  type Node,
  type OnConnectStartParams,
  useStore,
} from "@xyflow/svelte";

import useMemlogging from "../../modules/memlogging/useMemlogging";
import { slotStore } from "../data/slot-store";

function useDebugActions() {
  const { debugLog, warnLog } = useMemlogging();

  function isValidConnection(edge: Edge | Connection): boolean {
    //console.log("isValidConnection ... ", edge);
    //debugLog("Triggered: isValidConnection");
    return true;
  }

  function onbeforeconnect(connection: Connection): false | Connection {
    console.log("onbeforeconnect ... ", connection);
    debugLog("Triggered: onbeforeconnect");
    if (Math.random() < 1.5) {
      return connection;
    }
    warnLog(`Rejected connection ${connection.source} -> ${connection.target}`);
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

  function ondelete({ nodes, edges }: { nodes: Node[]; edges: Edge[] }): void {
    console.log("In ondelete ...");
    slotStore.deleteElements(nodes, edges);
    const message = `Deleted ${nodes.length} nodes, ${edges.length} edges`;
    debugLog(message);
  }

  return {
    isValidConnection,
    onbeforeconnect,
    onconnect,
    onconnectstart,
    onconnectend,
    ondelete,
  };
}

export default useDebugActions;
