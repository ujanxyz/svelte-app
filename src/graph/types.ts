import type {
  Edge,
  EdgeProps,
  Node,
  NodeProps,
  XYPosition,
} from "@xyflow/svelte";

import type { FuncSpec } from "../modules/fngallery/types";
import type { ClientXY, StatusOr } from "../overlay/types";

type ParamBase = {
  name: string;
  type: string;
};

type InConnection = {
  inEdge?: string; // Id of incoming edge, if connected.
  inFlowing?: boolean; // If data is flowing along this edge.
};

type OutConnection = {
  outEdge?: string; // Id of incoming edge, if connected.
  outFlowing?: boolean; // If data is flowing along this edge.
};

type InParam = ParamBase & InConnection;
type OutParam = ParamBase & OutConnection;
type InOutParam = ParamBase & InConnection & OutConnection;

export interface UjNodeData extends Record<string, unknown> {
  label: string;
  funcid: string;
  _funspec: FuncSpec; // Debug only.
  ins: InParam[];
  outs: OutParam[];
  inouts: InOutParam[];
}

interface UjNodeStorage {
  id: string;
  data: UjNodeData;
  position: XYPosition;
}

interface UjEdgeStorage {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
}

export interface UjGraphStorage {
  nodes: UjNodeStorage[];
  edges: UjEdgeStorage[];
}

// Keep this flat object, it is used as non-reactive value in SvelteMap.
export interface UjSlotInfo {
  parentNode: string;
  paramname: string;
  datatype: string;
  state: "blank" | "edge" | "data";
}

export interface UjOverrideData {
  datatype: string;
  timestamp: number;
  payload: object;
}

export interface UjEdgeData extends Record<string, unknown> {}

export type UjNode = Node<UjNodeData>;
export type UjNodeProps = NodeProps<UjNode>;
export type UjEdge = Edge<UjEdgeData>;
export type UjEdgeProps = EdgeProps<UjEdge>;
