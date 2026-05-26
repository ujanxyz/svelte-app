<script lang="ts">
import { SvelteMap } from "svelte/reactivity";

import type { grph } from "@/types/grph";

import { registerGraphService } from "../graph-services";

registerGraphService("reactiveService", _createReactiveStore());

function _createReactiveStore() {
  const nodeStates = new SvelteMap<string /* encoded node id */, grph.NodeState>();
  const slotStates = new SvelteMap<string /* encoded slot id */, grph.SlotState>();

  function setNodeState(nodeId: string, state: grph.NodeState): void {
      nodeStates.set(nodeId, state);
  }

  function useNodeState(nodeId: string): grph.NodeState {
    return nodeStates.get(nodeId)!;
  }

  function setSlotState(slotId: grph.EncodedSlotId, state: grph.SlotState): void {
    const catId = `${slotId.parent}-${slotId.name}`;
    slotStates.set(catId, state);
  }

  function useSlotState(slotId: grph.EncodedSlotId): grph.SlotState {
    const catId = `${slotId.parent}-${slotId.name}`;
    return slotStates.get(catId)!;
  }

  function deleteSlots(slotIds: grph.EncodedSlotId[]): void {
    for (const slotId of slotIds) {
      const catId = `${slotId.parent}-${slotId.name}`;
      slotStates.delete(catId);
    }
  }

  return {
    setNodeState,
    useNodeState,
    setSlotState,
    useSlotState,
    deleteSlots,
  };
}
</script>
