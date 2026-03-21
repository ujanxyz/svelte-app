import { SvelteMap } from "svelte/reactivity";

import { type UjExecdataTypes } from "./execdata-types";
import { type UjSavedTypes } from "./saved-types";
import type { Edge } from "@xyflow/svelte";



type UjOverrideData = any;

type XYSlotDataReactive = UjExecdataTypes<"slotReactive">;
type XYSlotDataStatic = UjExecdataTypes<"slotStatic">;

type XYNodeDataReactive = UjExecdataTypes<"nodeReactive">;
type XYNodeDataStatic = UjExecdataTypes<"nodeStatic">;

type UjSavedNodeSpec = UjSavedTypes<"node">;


/**
 * Create all slots (handles) for a given node spec.
 *
 * Each node type defines its slot topology and naming convention:
 *
 * - Graph Input ("in")
 *   - 1 output slot
 *   - "<id>$out"
 *
 * - Graph Output ("out")
 *   - 1 input slot
 *   - "<id>$in"
 *
 * - Function Node ("fn")
 *   - N input slots:  "<id>$in:<param-name>"
 *   - M output slots: "<id>$out:<param-name>"
 *
 * - Operator Node ("op")
 *   - 1 implicit input  slot: "<id>$in"
 *   - 1 implicit output slot: "<id>$out"
 *   - N named input slots:    "<id>$in:<param-name>"
 *
 * - Lambda Node ("lam")
 *   - 1 output slot (functor): "<id>$out"
 *   - N input slots:           "<id>$in:<param-name>"
 *
 * Notes:
 * - Only static fields are populated here.
 * - Runtime fields (`payload`, `edges`, `modified`) are initialized to defaults.
 */
function createSlots(nodeData: UjSavedTypes<"node">): XYSlotDataStatic[] {
  const slots: XYSlotDataStatic[] = [];
  const appendSlot = (id: string, nodeid: string, dtype: string, isoutput: boolean): void => {
    const slot = {id, nodeid, dtype, isoutput, payload: null, edges: [], modified: 0 } as XYSlotDataStatic;
    slots.push(slot);
  };

  switch (nodeData.kind) {
    case "in": {
      const n = nodeData as UjSavedTypes<"input">;
      appendSlot(`${n.id}$out`, n.id, n.dtype, true);
      break;
    }

    case "out": {
      const n = nodeData as UjSavedTypes<"output">;
      appendSlot(`${n.id}$in`, n.id, n.dtype, false);
      break;
    }

    case "fn": {
      const n = nodeData as UjSavedTypes<"function">;
      // Inputs
      for (const inp of n.ins) {
        appendSlot(`${n.id}$in:${inp.name}`, n.id, inp.dtype, false);
      }
      // Outputs
      for (const out of n.outs) {
        appendSlot(`${n.id}$out:${out.name}`, n.id, out.dtype, true);
      }
      break;
    }

    case "op": {
      const n = nodeData as UjSavedTypes<"operator">;
      // Implicit operable input/output
      appendSlot(`${n.id}$in`, n.id, n.dtype, false);
      appendSlot(`${n.id}$out`, n.id, n.dtype, true);
      // Named inputs
      for (const inp of n.ins) {
        appendSlot(`${n.id}$in:${inp.name}`, n.id, inp.dtype, false);
      }

      break;
    }

    case "lam": {
      const n = nodeData as UjSavedTypes<"lambda">;
      // TODO: Maybe encode this more richly later, e.g. fn(argtypes)->returns)
      appendSlot(`${n.id}$out`, n.id, "functor", true);
      // Input slots.
      for (const inp of n.ins) {
        appendSlot(`${n.id}$in:${inp.name}`, n.id, inp.datatype, false);
      }
      break;
    }

    default:
      // Exhaustiveness check (helps when adding new node kinds)
      const _never: never = nodeData;
      return _never;
  }

  return slots;
}






function _createSlotStore() {
  const slotsReactive = new SvelteMap<string, XYSlotDataReactive>();
  const slotsStatic = new Map<string, XYSlotDataStatic>();

  const nodesReactive = new SvelteMap<string, XYNodeDataReactive>();
  const nodesStatic = new Map<string, XYNodeDataStatic>();


  function useReactiveSlot(slotId: string): XYSlotDataReactive | undefined {
    return slotsReactive.get(slotId);
  }

  function reactiveSlotEntries(): [string, XYSlotDataReactive][] {
    return Array.from(slotsReactive.entries());
  }


  function ensureSlots(nodeSpecs: UjSavedNodeSpec[]): void {
    for (const nodeSpec of nodeSpecs) {
      if (nodesStatic.has(nodeSpec.id)) {
        throw new Error("Node id exists: " + nodeSpec.id);
      }
      const slots: XYSlotDataStatic[] = createSlots(nodeSpec);
      const slotids = [];
      for (const slot of slots) {
        slotids.push(slot.id);
        slotsStatic.set(slot.id, slot);
        const reactive: XYSlotDataReactive = {
          state: "blank",
          status: "empty",
          edges: 0,
        };
        slotsReactive.set(slot.id, reactive);
      }
      const nodeStatic: XYNodeDataStatic = {
        spec: nodeSpec, slotids,
      };
      const nodeReac: XYNodeDataReactive = {
        status: "waiting",
      };
      nodesStatic.set(nodeSpec.id, nodeStatic);
      nodesReactive.set(nodeSpec.id, nodeReac);
    }
  }

  function ensureConnections(edges: Edge[]): void {
    throw new Error("TODO: Implement this");
  }

  function lookupOverride(
    nodeId: string,
    slotName: string,
  ): UjOverrideData | null {
    throw new Error("TODO: Implement this");
  }

  function setOverride(
    nodeId: string,
    slotName: string,
    override: boolean,
    data: UjOverrideData | null = null,
  ): void {
    throw new Error("TODO: Implement this");
  }

  function deleteElements(nodes: Node[], edges: Edge[]): void {
    throw new Error("TODO: Implement this");
  }

  return {
    useReactiveSlot,
    reactiveSlotEntries,
    ensureSlots,
    ensureConnections,
    lookupOverride,
    setOverride,
    deleteElements,
  };
}