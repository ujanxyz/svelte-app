import { useSvelteFlow, type Edge, type Node } from "@xyflow/svelte";
import { CONTXT_KEY_XY_ACTIONS, MenuCodes } from "./constants";
import type { ClientXY, StatusOr } from "../../overlayv2/types";
import { getContext } from "svelte";
import type { XYActions } from "./types";
import { ReturnStatus } from "../../overlayv2/constants";
import useEventDispatch from "../../utils/useEventDispatch";
import { EventKinds } from "../../utils/constants";

function useXYMenus() {
  const xyActions = getContext(CONTXT_KEY_XY_ACTIONS) as XYActions;
  const { screenToFlowPosition } = useSvelteFlow();

  const dispatchRmNode = useEventDispatch(EventKinds.XY_RM_NODE);
  const dispatchRmEdge = useEventDispatch(EventKinds.XY_RM_EDGE);
  const dispatchRmSelection = useEventDispatch(EventKinds.XY_RM_SELECTION);

  async function onpanecontextmenu({ event }: { event: MouseEvent }): Promise<void> {
    const clientXY: ClientXY = {
      x: event.clientX,
      y: event.clientY,
    };
    event.preventDefault();
    const flowPosn = screenToFlowPosition(clientXY);
    const retval = await xyActions.menuInPane?.(clientXY) as StatusOr<string>;
    if (retval.status !== ReturnStatus.OK) return;
    switch (retval.value) {
      case "new":
        console.log("New fn !!!!", flowPosn);
    }
  }

  async function onnodecontextmenu({
    node,
    event,
  }: {
    node: Node;
    event: MouseEvent;
  }): Promise<void> {
    console.log("[on-node-context-menu]:", node);
    const clientXY: ClientXY = {
      x: event.clientX,
      y: event.clientY,
    };
    event.preventDefault();
    const retval = await xyActions.menuInNode?.(clientXY) as StatusOr<string>;
    if (retval.status !== ReturnStatus.OK) return;
    const nodeId = node.id as string;
    switch (retval.value) {
      case MenuCodes.RM_NODE:
        dispatchRmNode({ nodeId });
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
    const retval = await xyActions.menuInEdge?.(clientXY) as StatusOr<string>;
    if (retval.status !== ReturnStatus.OK) return;
    const edgeId = edge.id as string;
    switch (retval.value) {
      case MenuCodes.RM_EDGE:
        dispatchRmEdge({ edgeId });
    }
  }

  async function onselectioncontextmenu({
    nodes,
    event,
  }: {
    nodes: Node[];
    event: MouseEvent;
  }): Promise<void> {
    console.log("[on-selection-context-menu]:", nodes);
    console.log("In selection menu @@@@@@@");
    const clientXY: ClientXY = {
      x: event.clientX,
      y: event.clientY,
    };
    event.preventDefault();
    const retval = await xyActions.menuInSelection?.(clientXY) as StatusOr<string>;
    if (retval.status !== ReturnStatus.OK) return;
    switch (retval.value) {
      case MenuCodes.RM_SELECTION:
        dispatchRmSelection({ nodes });
    }
  }

  function openGallery() {
    throw new Error("openGallery: Not implemented !");
  }

  return {
    onpanecontextmenu,
    onnodecontextmenu,
    onedgecontextmenu,
    onselectioncontextmenu,
    openGallery,
  };
}

export default useXYMenus;
