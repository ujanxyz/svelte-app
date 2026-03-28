import {
  type Edge as XYFlowEdge,
  type Node as XYFlowNode,
} from "@xyflow/svelte";

import { type UjSavedTypes } from "./saved-types";

//--------------------------------------------------------------------------------------------------

interface XYSlotDataStatic {
  id: string; // Id of this slot.
  nodeid: string; // The parent node id.
  dtype: string; // The data type.
  isoutput: boolean; // is output slot, else input.
  payload: any | null;
  edges: string[]; // Look up in edges store.
  modified: number;
}

// Map value stored keyed by slot id.
interface XYSlotDataReactive {
  state: "blank" | "edge" | "data";
  status: "empty" | "set" | "error";
  edges: number;
}

type XYSlotDataStaticMap = Map<string /* slot id */, XYSlotDataStatic>;
type XYSlotDataReactiveMap = Map<string /* slot id */, XYSlotDataReactive>;

interface XYNodeDataStatic {
  spec: UjSavedTypes<"node">;
  slotids: string[]; // Lookup in the slots store.
}

interface XYNodeDataReactive {
  status: "running" | "ready" | "waiting" | "error";
}

type XYNodeDataStaticMap = Map<string /* node id */, XYNodeDataStatic>;
type XYNodeDataReactiveMap = Map<string /* node id */, XYNodeDataReactive>;

interface XYEdgeDataStatic {
  spec: UjSavedTypes<"edge">;
}

interface XYEdgeDataReactive {
  status: "running" | "ready" | "waiting" | "error";
}

type XYEdgeDataStaticMap = Map<string /* edge id */, XYEdgeDataStatic>;
type XYEdgeDataReactiveMap = Map<string /* edge id */, XYEdgeDataReactive>;

/**
 * Do not export the types directly, rather via keyed lookups.
 */

type _PublicTypeMap = {
  slotReactive: XYSlotDataReactive;
  slotStatic: XYSlotDataStatic;

  nodeReactive: XYNodeDataReactive;
  nodeStatic: XYNodeDataStatic;

  edgeReactive: XYEdgeDataReactive;
  edgeStatic: XYEdgeDataStatic;
};

export type UjExecdataTypes<K extends keyof _PublicTypeMap> =
  K extends keyof _PublicTypeMap ? _PublicTypeMap[K] : never;
