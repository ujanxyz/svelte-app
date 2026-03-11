import {
  useSvelteFlow,
  type Edge,
  type Node,
  type XYPosition,
} from "@xyflow/svelte";
import { MenuCodes } from "../constants";
import type { ClientXY } from "../../overlay/types";
import { ReturnStatus } from "../../overlay/constants";
import { useGraphService } from "../graph-services";
import { lookupFnDetailsAsync } from "../../modules/fngallery/apiFunctionInfos";
import { makeNodeCreator } from "../nodes/nodeCreator";

export default function useMenusAndPopups() {
  const flowGraphService = useGraphService("flowGraphService");
  const menuService = useGraphService("menuService");
  const galleryService = useGraphService("galleryService");

  const nodeCreator = makeNodeCreator();
  const { screenToFlowPosition } = useSvelteFlow();

  // const dispatchRmNode = useEventDispatch(EventKinds.XY_RM_NODE);
  // const dispatchRmEdge = useEventDispatch(EventKinds.XY_RM_EDGE);
  // const dispatchRmSelection = useEventDispatch(EventKinds.XY_RM_SELECTION);
  // const dispatchPickFn = useEventDispatch(EventKinds.FN_GALLERY_SELECT);

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
    const flowPosn = screenToFlowPosition(clientXY);
    const retval = await menuService.menuInPane(clientXY);
    if (retval.status !== ReturnStatus.OK) return;
    switch (retval.value) {
      case MenuCodes.NEW_NODE:
        await _internalOpenGallery(flowPosn);
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
    connectionState: any,
  ): Promise<void> {
    const clientXY: ClientXY = getClientXY(event);
    event.preventDefault();
    const retval = await menuService.menuInConnEnd(clientXY);
    if (retval.status !== ReturnStatus.OK) return;
    console.log(retval);
    switch (retval.value) {
    }
  }

  async function onpopupgallery(event: MouseEvent): Promise<void> {
    const clientXY: ClientXY = {
      x: event.clientX,
      y: event.clientY,
    };
    event.preventDefault();
    const flowPosn = screenToFlowPosition(clientXY);
    await _internalOpenGallery(flowPosn);
  }

  async function _internalOpenGallery(position: XYPosition): Promise<void> {
    const retval = await galleryService.pickFnFromGallery();
    if (retval.status !== ReturnStatus.OK) return;
    console.log(retval.value);
    const funcId = retval.value as string;
    const funcspec = await lookupFnDetailsAsync(funcId);
    if (!funcspec) {
      // TODO: Make error toast.
      throw new Error("Function not found: " + funcId);
    }
    const newNode = nodeCreator.newNodFromFunc(funcspec, position);
    await flowGraphService.appendNode(newNode);
  }

  function getClientXY(event: MouseEvent | TouchEvent): ClientXY {
    if (event instanceof MouseEvent) {
      return { x: event.clientX, y: event.clientY };
    } else {
      const touch = event.touches[0] ?? event.changedTouches[0];
      return { x: touch.clientX, y: touch.clientY };
    }
  }

  return {
    onpanecontextmenu,
    onnodecontextmenu,
    onedgecontextmenu,
    onselectioncontextmenu,
    onconnectend,
    // Custom app-declared handlers.
    onpopupgallery,
  };
}
