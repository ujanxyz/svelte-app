import type { XYPosition } from "@xyflow/svelte";
import type { FuncSpec } from "../../modules/fngallery/types";

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

export interface NodeDetailsData extends Record<string, unknown> {
  label: string;
  funcid: string;
  _funspec: FuncSpec; // Debug only.
  ins: InParam[];
  outs: OutParam[];
  inouts: InOutParam[];
}
