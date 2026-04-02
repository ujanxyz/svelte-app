import { type Edge, type Node, type XYPosition } from "@xyflow/svelte";
import { type FinalConnectionState } from "@xyflow/system";

import { lookupFnDetailsAsync } from "../../modules/fngallery/apiFunctionInfos";
import { ReturnStatus } from "../../overlay/constants";
import type { ClientXY } from "../../overlay/types";
import { MenuCodes } from "../constants";
import { useGraphService } from "../graph-services";

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

  // const dispatchRmNode = useEventDispatch(EventKinds.XY_RM_NODE);
  // const dispatchRmEdge = useEventDispatch(EventKinds.XY_RM_EDGE);
  // const dispatchRmSelection = useEventDispatch(EventKinds.XY_RM_SELECTION);
  // const dispatchPickFn = useEventDispatch(EventKinds.FN_GALLERY_SELECT);

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
    if (retval.status !== ReturnStatus.OK) return;
    console.log(retval.value);
    switch (retval.value) {
      case MenuCodes.NEW_NODE:
        await _internalOpenGallery(flowPosn);
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
    if (retval.status !== ReturnStatus.OK) return;
    const nodeId = node.id as string;
    switch (retval.value) {
      case MenuCodes.RM_NODE:
        await flowGraphService.deleteNode(nodeId);
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
    const retval = await menuService.menuInEdge(clientXY);
    if (retval.status !== ReturnStatus.OK) return;
    const edgeId = edge.id as string;
    switch (retval.value) {
      case MenuCodes.RM_EDGE:
        await flowGraphService.deleteEdge(edgeId);
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
    const retval = await menuService.menuInSelection(clientXY);
    if (retval.status !== ReturnStatus.OK) return;
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

    const retval = await menuService.menuInConnEnd(clientXY);
    if (retval.status !== ReturnStatus.OK) return;
    console.log(retval);
    switch (retval.value) {
      default:
        _internalOpenGallery(flowPosn);
      // TODO: Continue to connect the edge.
    }
  }

  async function onpopupgallery(event: MouseEvent): Promise<void> {
    const clientXY: ClientXY = {
      x: event.clientX,
      y: event.clientY,
    };
    event.preventDefault();
    await _internalOpenGallery(rawStoreService.pivot);
  }

  async function ondatainspector(event: MouseEvent): Promise<void> {
    await popupService.flowDataInspector();
  }

  async function onsavelocalstorage(): Promise<void> {
    const nodes = flowGraphService.allNodes();
    const edges = flowGraphService.allEdges();
    const viewport = rawStoreService.currentViewport();
    const graph = ioService.serializeObject(nodes, edges, viewport);
    console.log("Save json .. ", graph);
  }

  async function _internalOpenGallery(position: XYPosition): Promise<void> {
    const retval = await popupService.nodeFunctionGallery();
    if (retval.status !== ReturnStatus.OK) return;
    console.log(retval.value);
    const funcId = retval.value as string;
    const funcInfo = await lookupFnDetailsAsync(funcId);
    if (!funcInfo) {
      // TODO: Make error toast.
      throw new Error("Function not found: " + funcId);
    }
    const newNode = await ioService.createNodeAt(funcInfo, position);
    await flowGraphService.appendNode(newNode);
  }

  return {
    onpaneclick,
    onpanecontextmenu,
    onnodecontextmenu,
    onedgecontextmenu,
    onselectioncontextmenu,
    onconnectend,
    // Custom app-declared handlers.
    onsavelocalstorage,
    onpopupgallery,
    ondatainspector,
  };
}
