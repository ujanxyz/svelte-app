import type {
  Viewport,
  XYPosition,
} from "@xyflow/svelte";

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
  viewport: Viewport;
}
