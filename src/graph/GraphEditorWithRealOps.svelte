<script lang="ts">
import ContextMenuServiceRegistrar from "./data/ContextMenuServiceRegistrar.svelte";
import ExternalEventHandlers from "./data/ExternalEventHandlers.svelte";
import FlowGraphServiceRegistrar from "./data/FlowGraphServiceRegistrar.svelte";
import GalleryServiceRegistrar from "./data/GalleryServiceRegistrar.svelte";
import FlowGraphWrapper from "./xyflow/FlowGraphWrapper.svelte";
import ObserveConnection from "./xyflow/ObserveConnection.svelte";
</script>

<FlowGraphWrapper
  atBeforeFlow={beforeFlowRealOps}
  atAfterFlow={afterFlowRealOps}
/>

{#snippet beforeFlowRealOps()}
  <FlowGraphServiceRegistrar />
  <ContextMenuServiceRegistrar />
  <GalleryServiceRegistrar />
{/snippet}

{#snippet afterFlowRealOps()}
  <ExternalEventHandlers />
  <ObserveConnection />
{/snippet}
