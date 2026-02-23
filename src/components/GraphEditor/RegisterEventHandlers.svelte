<script lang="ts">
  import { onMount } from "svelte";
  import type { Node } from '@xyflow/svelte';
  import { EventKinds } from "../../utils/constants";
  import useEventConsumer from "../../utils/useEventConsumer";
  import useGraphOps from "./useGraphOps";

  const {handleEvent, clearHandlers} = useEventConsumer();
  const ops = useGraphOps();
  let nextNodeId = 10;

  onMount(() => {
    handleEvent(EventKinds.FN_GALLERY_SELECT, _xyAddNode);
    handleEvent(EventKinds.XY_RM_NODE, _xyRmNode);
    handleEvent(EventKinds.XY_RM_EDGE, _xyRmEdge);    
    return () => clearHandlers();
  });

  function _xyAddNode (payload: {code: string}) {
    const node: Node = {
      id: ("n-" + nextNodeId),
      data: { label: payload.code },
      type: 'default', position: { x: 200, y: 200 + nextNodeId * 20 },
    };
    ++nextNodeId;
    ops.addNode(node);
  }

  function _xyRmNode (payload: {nodeId: string}) {
    ops.rmNode(payload.nodeId);
  }

  function _xyRmEdge (payload: {edgeId: string}) {
    ops.rmEdge(payload.edgeId);
  }

</script>

<!-- No HTML template, everything via UI registration above -->