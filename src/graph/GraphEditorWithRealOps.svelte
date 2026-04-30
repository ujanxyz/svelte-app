<script lang="ts">
import ExternalEventHandlers from "./data/ExternalEventHandlers.svelte";
import ManageConnection from "./data/ManageConnection.svelte";
import ManageGraphIO from "./data/ManageGraphIO.svelte";
import ManageGraphUpdates from "./data/ManageGraphUpdates.svelte";
import RegisterFlowGraphService from "./data/RegisterFlowGraphService.svelte";
import RegisterIoService from "./data/RegisterIoService.svelte";
import RegisterPopupService from "./data/RegisterPopupService.svelte";
import RegisterRawStoreService from "./data/RegisterRawStoreService.svelte";
import RegisterReactiveService from "./data/RegisterReactiveService.svelte";
import FlowGraphWrapper from "./xyflow/FlowGraphWrapper.svelte";
</script>

<FlowGraphWrapper
  atBeforeFlow={beforeFlowRealOps}
  atAfterFlow={afterFlowRealOps}
/>

{#snippet beforeFlowRealOps()}
  <RegisterRawStoreService />
  <RegisterReactiveService />
  <RegisterIoService />
  <RegisterFlowGraphService />
  <RegisterPopupService />
{/snippet}

{#snippet afterFlowRealOps()}
  <ManageConnection />
  <ManageGraphIO />
  <ManageGraphUpdates />
  <ExternalEventHandlers />
{/snippet}
