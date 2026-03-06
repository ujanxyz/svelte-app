import { useSvelteFlow, type Edge, type Node } from "@xyflow/svelte";
import { useOverlayConsumer } from "../../overlay";
import { OverlayTriggers } from "./constants";

function useXYMenus() {
  const { showAsCtxMenu, showAtTop } = useOverlayConsumer();
  const { screenToFlowPosition } = useSvelteFlow();

  function onpanecontextmenu({ event }: { event: MouseEvent }): void {
    const flowPosn = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    showAsCtxMenu(OverlayTriggers.PANE_CTX_MENU, event, {
      flowPosn,
    });
  }

  function onnodecontextmenu({
    node,
    event,
  }: {
    node: Node;
    event: MouseEvent;
  }): void {
    //showAsCtxMenu(OverlayTriggers.NODE_CTX_MENU, event, { node });
  }

  function onedgecontextmenu({
    edge,
    event,
  }: {
    edge: Edge;
    event: MouseEvent;
  }): void {
    showAsCtxMenu(OverlayTriggers.EDGE_CTX_MENU, event, { edge });
  }

  function onselectioncontextmenu({
    nodes,
    event,
  }: {
    nodes: Node[];
    event: MouseEvent;
  }): void {
    showAsCtxMenu(OverlayTriggers.SELECTION_CTX_MENU, event, { nodes });
  }

  function openGallery() {
    showAtTop(OverlayTriggers.GALLERY_POPUP, {});
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
