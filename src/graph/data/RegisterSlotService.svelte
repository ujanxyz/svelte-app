<script lang="ts">
import type { Edge, Node } from "@xyflow/svelte";
import { SvelteMap } from "svelte/reactivity";

import type { plstate } from "@/types/plstate";

import { registerGraphService } from "../graph-services";
import type { UjNodeData, UjOverrideData, UjSlotInfo } from "../types";
import type { plinfo } from "@/types/plinfo";

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
  function useSlotInfo(
    nodeId: string,
    paramName: string,
  ): UjSlotInfo | undefined {
    const slotId = `${nodeId}-${paramName}`;
    return slotsMap.get(slotId);
  }

  function reactiveSlotEntries(): [string, UjSlotInfo][] {
    return Array.from(slotsMap.entries());
  }

  function ensureSlots(nodes: Node[]): void {
    for (const node of nodes) {
      const nodeId = node.id as string;
      const nodeData = node.data as UjNodeData;
      for (const { name: paramname, type: datatype } of nodeData.ins) {
        const slotId = `${node.id}-${paramname}`;
        if (!slotsMap.has(slotId)) {
          slotsMap.set(slotId, {
            parentNode: nodeId,
            paramname,
            datatype,
            state: "blank",
          });
        }
      }
      for (const { name: paramname, type: datatype } of nodeData.outs) {
        const slotId = `${node.id}-${paramname}`;
        if (!slotsMap.has(slotId)) {
          slotsMap.set(slotId, {
            parentNode: nodeId,
            paramname,
            datatype,
            state: "blank",
          });
        }
      }
      for (const { name: paramname, type: datatype } of nodeData.inouts) {
        const slotIdIn = `${node.id}-${paramname}/in`;
        if (!slotsMap.has(slotIdIn)) {
          slotsMap.set(slotIdIn, {
            parentNode: nodeId,
            paramname,
            datatype,
            state: "blank",
          });
        }
        const slotIdOut = `${node.id}-${paramname}/out`;
        if (!slotsMap.has(slotIdOut)) {
          slotsMap.set(slotIdOut, {
            parentNode: nodeId,
            paramname,
            datatype,
            state: "blank",
          });
        }
      }
    }
  }

  function ensureConnections(edges: Edge[]): void {
    const matchedSlotIds = new Set<string>();
    for (const edge of edges) {
      const { source, sourceHandle, target, targetHandle } = edge;
      const sourceSlot = `${source}-${sourceHandle}`;
      matchedSlotIds.add(sourceSlot);
      const targetSlot = `${target}-${targetHandle}`;
      matchedSlotIds.add(targetSlot);
    }
    for (const slotId of slotsMap.keys()) {
      const slotInfo = slotsMap.get(slotId)!;
      if (matchedSlotIds.has(slotId) === (slotInfo.state === "edge")) {
        // No change in matched / unmatched.
        // If not matched it remains as blank or overridden.
        continue;
      }
      slotInfo.state = matchedSlotIds.has(slotId) ? "edge" : "blank";
      if (slotInfo.state === "edge") {
        // If this has transitioned into "edge" state, it is possible that the last state was "data".
        // In that case we need to clear any stored data.
        dataMap.delete(slotId);
      }
      slotsMap.set(slotId, { ...slotInfo });
    }
  }

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

  function deleteElements(nodes: Node[], edges: Edge[]): void {
    // Delete the slots of the deleted nodes.
    const delNodeIds = new Set<string>();
    for (const { id: nodeId } of nodes) {
      delNodeIds.add(nodeId);
    }
    const delSlotIds = new Set<string>();
    for (const slotId of slotsMap.keys()) {
      const nodeId = slotsMap.get(slotId)?.parentNode as string;
      if (delNodeIds.has(nodeId)) {
        delSlotIds.add(slotId);
      }
    }
    delSlotIds.forEach((slotId: string) => {
      if (slotsMap.has(slotId)) {
        slotsMap.delete(slotId);
        dataMap.delete(slotId);
      }
    });

    // Mark (as "clear") the input slots at the targets of the deleted edges.
    // for (const {target, targetHandle} of edges) {
    //   const targetSlot = `${target}-${targetHandle}`;
    //   const slotInfo = slotsMap.get(targetSlot);
    //   if (!slotInfo) continue;
    //   slotInfo.state = "blank";
    // }
  }

  return {
    setNodeState,
    useNodeState,
    setSlotState,
    useSlotState,
    deleteSlots,
    testUpdate,

    useSlotInfo,
    reactiveSlotEntries,
    ensureSlots,
    ensureConnections,
    lookupOverride,
    setOverride,
    deleteElements,
  };
}
</script>
