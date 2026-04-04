<script lang="ts">
//import { useEdges, useNodes } from "@xyflow/svelte";

import { useGraphService } from "../graph-services";

const slotService = useGraphService("slotService");

// const edges = useEdges();
// const nodes = useNodes();

$effect(() => {
  // const currNodes = nodes.current;
  // const currEdges = edges.current;
  // console.log(
  //   `Received graph update, nodes:${currNodes.length}, edges: ${currEdges.length}`,
  // );
  // slotService.ensureSlots(currNodes);
  // slotService.ensureConnections(currEdges);
});
</script>
