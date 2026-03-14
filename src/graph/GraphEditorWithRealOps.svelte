<script lang="ts">
import ContextMenuServiceRegistrar from "./data/ContextMenuServiceRegistrar.svelte";
import ExternalEventHandlers from "./data/ExternalEventHandlers.svelte";
import FlowGraphServiceRegistrar from "./data/FlowGraphServiceRegistrar.svelte";
import GalleryServiceRegistrar from "./data/GalleryServiceRegistrar.svelte";
import ObserveSlots from "./data/ObserveSlots.svelte";
import FlowGraphWrapper from "./xyflow/FlowGraphWrapper.svelte";
import ObserveConnection from "./xyflow/ObserveConnection.svelte";
import ObserveEdges from "./xyflow/ObserveEdges.svelte";
</script>

<FlowGraphWrapper
  atBeforeFlow={beforeFlowRealOps}
  atAfterFlow={afterFlowRealOps}
/>

{#snippet beforeFlowRealOps()}
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
{/snippet}
