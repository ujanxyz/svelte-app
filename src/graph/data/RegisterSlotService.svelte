<script lang="ts">
import type { Edge, Node } from "@xyflow/svelte";
import { SvelteMap } from "svelte/reactivity";

import { registerGraphService } from "../graph-services";
import type { UjNodeData, UjOverrideData, UjSlotInfo } from "../types";

registerGraphService("slotService", _createSlotStore());

function _createSlotStore() {
  const slotsMap = new SvelteMap<string, UjSlotInfo>();
  // Override (node input) data keyed by slot id.
  // This is a non-reactive map with same keys, but the entries exist only if
  // the corresponding value in slotsMap has `state: "data"`.
  const dataMap = new Map<string, UjOverrideData>();

  function useSlotInfo(
    nodeId: string,
    paramName: string,
  ): UjSlotInfo | undefined {
    const slotId = `${nodeId}-${paramName}`;
    return slotsMap.get(slotId);
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
    useSlotInfo,
    ensureSlots,
    ensureConnections,
    lookupOverride,
    setOverride,
    deleteElements,
  };
}

</script>