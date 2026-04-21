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
  export interface xyBaseNodeData extends Record<string, unknown>  {
    info: plinfo.NodeInfo;
  };

  export interface xyFuncNodeData extends xyBaseNodeData {
    info: plinfo.NodeInfo;
    inInfos: plinfo.SlotInfo[];
    outInfos: plinfo.SlotInfo[];
    inoutInfos: plinfo.SlotInfo[];
  };

  export interface xyGraphIoNodeData extends xyBaseNodeData {
    info: plinfo.NodeInfo;
    slotInfo: plinfo.SlotInfo;
  };

  export interface xyEdgeData extends Record<string, unknown>  {
    info: plinfo.EdgeInfo;
  };

  export type xyNode = Node<xyBaseNodeData>;
  export type xyNodeProps = NodeProps<xyNode>;
  export type xyEdge = Edge<xyEdgeData>;
  export type xyEdgeProps = EdgeProps<xyEdge>;
}
