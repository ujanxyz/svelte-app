import {
  useSvelteFlow,
  type Edge,
  type Node,
  type XYPosition,
} from "@xyflow/svelte";
import { CONTXT_KEY_XY_ACTIONS, MenuCodes } from "./constants";
import type { ClientXY, StatusOr } from "../../overlay/types";
import { getContext } from "svelte";
import type { MenuFunction, PopupFunction, XYActions } from "./types";
import { ReturnStatus } from "../../overlay/constants";
import useEventDispatch from "../../utils/useEventDispatch";
import { EventKinds } from "../../utils/constants";

export default function useMenusAndPopups() {
  const xyActions = getContext(CONTXT_KEY_XY_ACTIONS) as XYActions;
  const { screenToFlowPosition } = useSvelteFlow();

  const dispatchRmNode = useEventDispatch(EventKinds.XY_RM_NODE);
  const dispatchRmEdge = useEventDispatch(EventKinds.XY_RM_EDGE);
  const dispatchRmSelection = useEventDispatch(EventKinds.XY_RM_SELECTION);
  const dispatchPickFn = useEventDispatch(EventKinds.FN_GALLERY_SELECT);

  async function onpanecontextmenu({
    event,
  }: {
    event: MouseEvent;
  }): Promise<void> {
    console.log("In onpanecontextmenu ..", xyActions);
    const clientXY: ClientXY = {
      x: event.clientX,
      y: event.clientY,
    };
    event.preventDefault();
    const flowPosn = screenToFlowPosition(clientXY);
    const retval = (await (xyActions.menuInPane as MenuFunction)(
      clientXY,
    )) as StatusOr<string>;
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
    console.log("[on-node-context-menu]:", node);
    const clientXY: ClientXY = {
      x: event.clientX,
      y: event.clientY,
    };
    event.preventDefault();
    const retval = (await (xyActions.menuInNode as MenuFunction)(
      clientXY,
    )) as StatusOr<string>;
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
    const retval = (await (xyActions.menuInEdge as MenuFunction)(
      clientXY,
    )) as StatusOr<string>;
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
    const clientXY: ClientXY = {
      x: event.clientX,
      y: event.clientY,
    };
    event.preventDefault();
    const retval = (await (xyActions.menuInSelection as MenuFunction)(
      clientXY,
    )) as StatusOr<string>;
    if (retval.status !== ReturnStatus.OK) return;
    switch (retval.value) {
      case MenuCodes.RM_SELECTION:
        dispatchRmSelection({ nodes });
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
    const retval = (await (
      xyActions.popupGallery as PopupFunction
    )()) as StatusOr<string>;
    if (retval.status !== ReturnStatus.OK) return;
    console.log(retval.value);
    dispatchPickFn({ code: retval.value, position });
  }

  return {
    onpanecontextmenu,
    onnodecontextmenu,
    onedgecontextmenu,
    onselectioncontextmenu,
    // Custom app-declared handlers.
    onpopupgallery,
  };
}
