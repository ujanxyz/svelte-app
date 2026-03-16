<script lang="ts">
import ExternalEventHandlers from "./data/ExternalEventHandlers.svelte";
import ManageConnection from "./data/ManageConnection.svelte";
import ManageGraphIO from "./data/ManageGraphIO.svelte";
import ManageGraphUpdates from "./data/ManageGraphUpdates.svelte";
import ObserveEdges from "./data/ObserveEdges.svelte";
import RegisterContextMenuService from "./data/RegisterContextMenuService.svelte";
import RegisterFlowGraphService from "./data/RegisterFlowGraphService.svelte";
import RegisterIoService from "./data/RegisterIoService.svelte";
import RegisterPopupService from "./data/RegisterPopupService.svelte";
import RegisterRawStoreService from "./data/RegisterRawStoreService.svelte";
import RegisterSlotService from "./data/RegisterSlotService.svelte";
import FlowGraphWrapper from "./xyflow/FlowGraphWrapper.svelte";
</script>

<FlowGraphWrapper
  atBeforeFlow={beforeFlowRealOps}
  atAfterFlow={afterFlowRealOps}
/>

{#snippet beforeFlowRealOps()}
  <RegisterRawStoreService />
  <RegisterSlotService />
  <RegisterIoService />
  <RegisterFlowGraphService />
  <RegisterContextMenuService />
  <RegisterPopupService />
  <!-- Observers.. -->
  <ObserveEdges />
{/snippet}

{#snippet afterFlowRealOps()}
  <ManageConnection />
  <ManageGraphIO />
  <ManageGraphUpdates />
  <ExternalEventHandlers />
{/snippet}
