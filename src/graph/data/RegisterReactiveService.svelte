<script lang="ts">
import { SvelteMap } from "svelte/reactivity";

import type { plinfo } from "@/types/plinfo";
import type { plstate } from "@/types/plstate";

import { registerGraphService } from "../graph-services";

registerGraphService("reactiveService", _createReactiveStore());

function _createReactiveStore() {
  const nodeStates = new SvelteMap<number, plstate.NodeState>();
  const slotStates = new SvelteMap<string, plstate.SlotState>();

  function setNodeState(rawNodeId: number, state: plstate.NodeState): void {
      nodeStates.set(rawNodeId, state);
  }

  function useNodeState(rawNodeId: number): plstate.NodeState {
    return nodeStates.get(rawNodeId)!;
  }

  function setSlotState(slotId: plinfo.SlotId, state: plstate.SlotState): void {
    const catId = `${slotId.parent}-${slotId.name}`;
    slotStates.set(catId, state);
  }

  function useSlotState(slotId: plinfo.SlotId): plstate.SlotState {
    const catId = `${slotId.parent}-${slotId.name}`;
    return slotStates.get(catId)!;
  }

  function deleteSlots(slotIds: plinfo.SlotId[]): void {
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
