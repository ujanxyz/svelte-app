import type {
  Edge,
  EdgeProps,
  Node,
  NodeProps,
} from "@xyflow/svelte";

import type { plinfo } from "./plinfo";

/**
 * Types related to XY-Flow graph components.
 */
export namespace xy {
  export interface xyNodeData extends Record<string, unknown>  {
    info: plinfo.NodeInfo;
    inInfos: plinfo.SlotInfo[];
    outInfos: plinfo.SlotInfo[];
    inoutInfos: plinfo.SlotInfo[];
  };

  export interface xyEdgeData extends Record<string, unknown>  {
    info: plinfo.EdgeInfo;
  };

  export type xyNode = Node<xyNodeData>;
  export type xyNodeProps = NodeProps<xyNode>;
  export type xyEdge = Edge<xyEdgeData>;
  export type xyEdgeProps = EdgeProps<xyEdge>;
}
