import { type Edge, type Node, type XYPosition } from "@xyflow/svelte";
import { type FinalConnectionState } from "@xyflow/system";

import type { ClientXY, StatusOr } from "@/types/base";
import type { fn } from "@/types/function";
import type { plinfo } from "@/types/plinfo";

import { MenuCodes } from "../constants";
import { useGraphService } from "../graph-services";

type Ntype = plinfo.NodeInfo["ntype"];

function getClientXY(event: MouseEvent | TouchEvent): ClientXY {
  if (event instanceof MouseEvent) {
    return { x: event.clientX, y: event.clientY };
  } else {
    const touch = event.touches[0] ?? event.changedTouches[0];
    return { x: touch.clientX, y: touch.clientY };
  }
}

export default function useMenusAndPopups() {
  const rawStoreService = useGraphService("rawStoreService");
  const ioService = useGraphService("ioService");
  const flowGraphService = useGraphService("flowGraphService");
  const menuService = useGraphService("menuService");
  const popupService = useGraphService("popupService");

  async function onpaneclick({ event }: { event: MouseEvent }): Promise<void> {
    event.preventDefault();
    rawStoreService.pivot = flowGraphService.screenToFlowXY(event);
  }

  async function onpanecontextmenu({
    event,
  }: {
    event: MouseEvent;
  }): Promise<void> {
    const clientXY: ClientXY = {
      x: event.clientX,
      y: event.clientY,
    };
    event.preventDefault();
    const flowPosn = flowGraphService.screenToFlowXY(event);
    const retval = await menuService.menuInPane(clientXY);
    if (retval.status !== "OK") return;
    switch (retval.value) {
      case MenuCodes.NEW_NODE:
        await _internalOpenGallery("FN", flowPosn);
        break;
      case MenuCodes.NEW_INPUT:
        await _internalOpenGallery("IN", flowPosn);
        break;
      case MenuCodes.NEW_OUTPUT:
        await _internalOpenGallery("OUT", flowPosn);
        break;
      case MenuCodes.RM_EDGES:
        await flowGraphService.deleteAllEdges();
        break;
      case MenuCodes.RM_NODES:
        await flowGraphService.deleteGraph();
        break;
    }
  }

  async function onnodecontextmenu({
    node,
    event,
  }: {
    node: Node;
    event: MouseEvent;
  }): Promise<void> {
    const clientXY: ClientXY = {
      x: event.clientX,
      y: event.clientY,
    };
    event.preventDefault();
    const retval = await menuService.menuInNode(clientXY);
    if (retval.status !== "OK") return;
    const nodeId = node.id as string;
    switch (retval.value) {
      case MenuCodes.RM_NODE:
        await flowGraphService.deleteNodes([nodeId]);
    }
  }

  async function onedgecontextmenu({
    edge,
    event,
  }: {
    edge: Edge;
    event: MouseEvent;
  }): Promise<void> {
    const clientXY: ClientXY = {
      x: event.clientX,
      y: event.clientY,
    };
    event.preventDefault();
    const retval = await menuService.menuInEdge(clientXY) as StatusOr<string>;
    if (retval.status !== "OK") return;
    const edgeId = edge.id as string;
    switch (retval.value) {
      case MenuCodes.RM_EDGE:
        await flowGraphService.deleteEdges([edgeId]);
    }
  }

  async function onselectioncontextmenu({
    nodes,
    event,
  }: {
    nodes: Node[];
    event: MouseEvent;
  }): Promise<void> {
    const clientXY: ClientXY = {
      x: event.clientX,
      y: event.clientY,
    };
    event.preventDefault();
    const retval = await menuService.menuInSelection(clientXY) as StatusOr<string>;
    if (retval.status !== "OK") return;
    switch (retval.value) {
      case MenuCodes.RM_SELECTION:
        console.log(nodes);
        await flowGraphService.deleteNodes(nodes.map((n: Node) => n.id));
    }
  }

  async function onconnectend(
    event: MouseEvent | TouchEvent,
    connectionState: FinalConnectionState,
  ): Promise<void> {
    event.preventDefault();
    const { fromNode, fromHandle, toNode } = connectionState;
    if (toNode !== null) {
      // Connection ended on a handle. This leads to edge creation, handled by XY-Flow.
      return;
    }
    console.log(
      "connectionState @ end = ",
      connectionState,
      fromNode,
      fromHandle,
    );

    const clientXY: ClientXY = getClientXY(event);
    const flowPosn: XYPosition = flowGraphService.screenToFlowXY(clientXY);

    const retval = await menuService.menuInConnEnd(clientXY) as StatusOr<string>;
    if (retval.status !== "OK") return;
    console.log(retval);
    switch (retval.value) {
      default:
        _internalOpenGallery("FN", flowPosn);
      // TODO: Continue to connect the edge.
    }
  }

  async function onpopupgallery(event: MouseEvent): Promise<void> {
    const clientXY: ClientXY = {
      x: event.clientX,
      y: event.clientY,
    };
    event.preventDefault();
    await _internalOpenGallery("FN", rawStoreService.pivot);
  }

  async function ondatainspector(event: MouseEvent): Promise<void> {
    throw new Error("Not implemented");
  }

  async function onsavelocalstorage(): Promise<void> {
    const nodes = flowGraphService.allNodes();
    const edges = flowGraphService.allEdges();
    const viewport = rawStoreService.currentViewport();
    const graph = ioService.serializeObject(nodes, edges, viewport);
    console.log("Save json .. ", graph);
  }

  async function onplaypipeline(): Promise<void> {
    await flowGraphService.playPipeline();
  }

  async function _internalOpenGallery(ntype: Ntype, position: XYPosition): Promise<void> {
    if (ntype === "FN") {
      const retval = await popupService.nodeTemplateGallery(ntype) as StatusOr<fn.FunctionInfo>;
      if (retval.status !== "OK") return;
      const funcInfo = retval.value as fn.FunctionInfo;
      await flowGraphService.newNodeAt(funcInfo, position);
    } else if (ntype === "IN" || ntype === "OUT") {
      const retval = await popupService.nodeTemplateGallery(ntype) as StatusOr<fn.GraphIoInfo>;
      if (retval.status !== "OK") return;
      const ioInfo = retval.value as fn.GraphIoInfo;
      await flowGraphService.newGraphIOAt(ioInfo.dtype, ntype === "OUT" /* isOutput */, position);
    }
  }

  return {
    onpaneclick,
    onpanecontextmenu,
    onnodecontextmenu,
    onedgecontextmenu,
    onselectioncontextmenu,
    onconnectend,
    // Custom app-declared handlers.
    onpopupgallery,
    ondatainspector,
    onsavelocalstorage,
    onplaypipeline,
  };
}
