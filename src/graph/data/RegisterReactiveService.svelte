<script lang="ts">
import { SvelteMap } from "svelte/reactivity";

import type { grph } from "@/types/grph";

import { registerGraphService } from "../graph-services";

registerGraphService("reactiveService", _createReactiveStore());

function _createReactiveStore() {
  const nodeStates = new SvelteMap<number, grph.NodeState>();
  const slotStates = new SvelteMap<string, grph.SlotState>();

  function setNodeState(rawNodeId: number, state: grph.NodeState): void {
      nodeStates.set(rawNodeId, state);
  }

  function useNodeState(rawNodeId: number): grph.NodeState {
    return nodeStates.get(rawNodeId)!;
  }

  function setSlotState(slotId: grph.SlotId, state: grph.SlotState): void {
    const catId = `${slotId.parent}-${slotId.name}`;
    slotStates.set(catId, state);
  }

  function useSlotState(slotId: grph.SlotId): grph.SlotState {
    const catId = `${slotId.parent}-${slotId.name}`;
    return slotStates.get(catId)!;
  }

  function deleteSlots(slotIds: grph.SlotId[]): void {
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
