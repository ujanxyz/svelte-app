<script lang="ts">
import { SvelteMap } from "svelte/reactivity";

import type { plinfo } from "@/types/plinfo";
import type { plstate } from "@/types/plstate";

import { registerGraphService } from "../graph-services";
import type { UjOverrideData, UjSlotInfo } from "../types";

registerGraphService("slotService", _createSlotStore());

function _createSlotStore() {
  const nodeStates = new SvelteMap<number, plstate.NodeState>();
  const slotStates = new SvelteMap<string, plstate.SlotState>();

  // Deprecated.
  const slotsMap = new SvelteMap<string, UjSlotInfo>();
  // Override (node input) data keyed by slot id.
  // This is a non-reactive map with same keys, but the entries exist only if
  // the corresponding value in slotsMap has `state: "data"`.
  const dataMap = new Map<string, UjOverrideData>();

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

  function testUpdate(): void {
    // Update all slot states with random genid.
    // for (const [slotId, slotState] of slotStates.entries()) {
    //   const newGenId: number = (Math.floor(Math.random() * 100000))|0;
    //   console.log(`Updating genId for ${slotId} to ${newGenId}`);
    //   slotStates.set(slotId, { ...slotState, genId: newGenId });
    // }
  }

  //----------------------------------------------------------------

  function lookupOverride(
    nodeId: string,
    slotName: string,
  ): UjOverrideData | null {
    const slotId = `${nodeId}-${slotName}`;
    const slotInfo = slotsMap.get(slotId);
    if (slotInfo && slotInfo.state === "data") {
      return dataMap.get(slotId) ?? null;
    } else {
      return null;
    }
  }

  function setOverride(
    nodeId: string,
    slotName: string,
    override: boolean,
    data: UjOverrideData | null = null,
  ): void {
    const slotId = `${nodeId}-${slotName}`;
    const slotInfo = slotsMap.get(slotId);
    if (!slotInfo) {
      console.warn("slot not found: " + slotId);
      console.log("All keys := ", Array.from(slotsMap.keys()));
      return;
    }
    if (override) {
      if (data === null) {
        throw new Error("Payload not provided");
      }
      dataMap.set(slotId, data);
    } else {
      dataMap.delete(slotId);
    }
    const newState = override ? "data" : "blank";
    if (slotInfo.state !== newState) {
      slotsMap.set(slotId, { ...slotInfo, state: newState });
    }
  }

  return {
    setNodeState,
    useNodeState,
    setSlotState,
    useSlotState,
    deleteSlots,
    testUpdate,

    
    lookupOverride,
    setOverride,
  };
}
</script>
