import type { Edge, Node } from "@xyflow/svelte";
import { useOverlayConsumer } from "../overlay";
import { OverlayTriggers } from "./constants";

function useXYMenus() {
    const {showAsCtxMenu, showAtTop} = useOverlayConsumer();

    function onpanecontextmenu({event}: {event: MouseEvent}): void {
      showAsCtxMenu(OverlayTriggers.PANE_CTX_MENU, event, {ppp: 123, nest: {a: 12, b:34}, KK: 2222});
    }

    function onnodecontextmenu({ node, event }: {node: Node, event: MouseEvent}): void {
      showAsCtxMenu(OverlayTriggers.NODE_CTX_MENU, event, {node});
    }

    function onedgecontextmenu({ edge, event }: { edge: Edge; event: MouseEvent; }): void {
      showAsCtxMenu(OverlayTriggers.EDGE_CTX_MENU, event, {edge});
    }

    function openGallery() {
      showAtTop(OverlayTriggers.GALLERY_POPUP, {});
    }

  return {onpanecontextmenu, onnodecontextmenu, onedgecontextmenu, openGallery};
}

export default useXYMenus;
