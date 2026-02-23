import type { Node } from "@xyflow/svelte";
import { useOverlayConsumer } from "../overlay";
import { OverlayTriggers } from "./constants";

function useXYMenus() {
    const {showAsCtxMenu, showAtTop} = useOverlayConsumer();

    function onpanecontextmenu({event}: {event: MouseEvent}) {
      showAsCtxMenu(OverlayTriggers.PANE_CTX_MENU, event, {ppp: 123, nest: {a: 12, b:34}, KK: 2222});
    }

    function onnodecontextmenu({ event, node }: {event: MouseEvent, node: Node}) {
      showAsCtxMenu(OverlayTriggers.NODE_CTX_MENU, event, {node});
    }

    function openGallery() {
      showAtTop(OverlayTriggers.GALLERY_POPUP, {});
    }

  return {onpanecontextmenu, onnodecontextmenu, openGallery};
}

export default useXYMenus;
