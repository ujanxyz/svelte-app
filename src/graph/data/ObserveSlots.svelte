<script lang="ts">
import { useConnection, useEdges, useNodes, useStore } from "@xyflow/svelte";
import { onMount } from "svelte";
import useEventDispatch from "../../utils/useEventDispatch";
import { SvelteMap } from "svelte/reactivity";
import type { UjEdge, UjNode } from "../types";
import { slotStore } from "./slot-store";

interface SlotInfo {
  parentNode: string;
  name: string;
  datatype: string;
  state: "blank" | "edge" | "data";
  data: any | null;
}

//const dispatchUpdatedEdges = useEventDispatch("eee");

onMount(() => {
  //handleEventAsync(EventKinds.XY_RM_NODE, flowGraphService.deleteNode);
  // handleEventAsync(EventKinds.FN_GALLERY_SELECT, _xyAddNodeAsync);
  // handleEvent(EventKinds.XY_RM_NODE, _xyRmNode);
  // handleEvent(EventKinds.XY_RM_EDGE, _xyRmEdge);
  // handleEvent(EventKinds.XY_RM_SELECTION, _xyRmSelection);
  // return () => clearHandlers();
});

const edges = useEdges();
const nodes = useNodes();

const store = $derived(useStore<UjNode, UjEdge>());
const conn = useConnection();
const slotsMap = new SvelteMap<string, SlotInfo>();

$effect(() => {

  const currEdges = edges.current;
  const currNodes = nodes.current; // $state.snapshot(nodes.current);
  // const currConn = $state.snapshot(conn).current;
  // console.log("UseStores @@@@@@@@@@@ ", currNodes, currEdges, conn.current);
  slotStore.ensureSlots(currNodes);
  slotStore.ensureConnections(currEdges);
  //dispatchUpdatedEdges(currEdges);
});
</script>
