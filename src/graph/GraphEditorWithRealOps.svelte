<script lang="ts">
import ContextMenuServiceRegistrar from "./data/ContextMenuServiceRegistrar.svelte";
import ExternalEventHandlers from "./data/ExternalEventHandlers.svelte";
import FlowGraphServiceRegistrar from "./data/FlowGraphServiceRegistrar.svelte";
import GalleryServiceRegistrar from "./data/GalleryServiceRegistrar.svelte";
import IoManager from "./data/IoManager.svelte";
import IoServiceRegistrar from "./data/IoServiceRegistrar.svelte";
import ObserveSlots from "./data/ObserveSlots.svelte";
import RawStoreServiceRegistrar from "./data/RawStoreServiceRegistrar.svelte";
import FlowGraphWrapper from "./xyflow/FlowGraphWrapper.svelte";
import ObserveConnection from "./xyflow/ObserveConnection.svelte";
import ObserveEdges from "./xyflow/ObserveEdges.svelte";
</script>

<FlowGraphWrapper
  atBeforeFlow={beforeFlowRealOps}
  atAfterFlow={afterFlowRealOps}
/>

{#snippet beforeFlowRealOps()}
  <RawStoreServiceRegistrar />
  <IoServiceRegistrar />
  <FlowGraphServiceRegistrar />
  <ContextMenuServiceRegistrar />
  <GalleryServiceRegistrar />
  <!-- Observers.. -->
  <ObserveConnection />
  <ObserveEdges />
  <ObserveSlots />
{/snippet}

{#snippet afterFlowRealOps()}
  <ExternalEventHandlers />
  <IoManager />
{/snippet}
