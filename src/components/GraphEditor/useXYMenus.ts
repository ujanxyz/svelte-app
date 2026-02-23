import type { Node, NodeEventWithPointer } from "@xyflow/svelte";
import { useOverlayConsumer } from "../overlay";

function useXYMenus() {
    const {showAtTarget, showAtTop} = useOverlayConsumer();

    function onpanecontextmenu({event}: {event: MouseEvent}) {
      event.preventDefault();
      const {clientX, clientY} = event;
      showAtTarget("pane", [clientX, clientY]);
    }

    function onnodecontextmenu({ event, node }: {event: MouseEvent, node: Node}) {
      event.preventDefault();
      const {clientX, clientY} = event;
      console.log("Node menu ....");
      showAtTarget("node", [clientX, clientY]);
    }

    function openGallery() {
      showAtTop("func");
    }

  return {onpanecontextmenu, onnodecontextmenu, openGallery};
}

export default useXYMenus;
