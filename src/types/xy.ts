import type {
  Edge,
  EdgeProps,
  Node,
  NodeProps,
} from "@xyflow/svelte";

import type { base } from "@/types//base";
import type { grph } from "@/types/grph";

/**
 * Types related to XY-Flow graph components.
 */
export namespace xy {
  export interface xyBaseNodeData extends Record<string, unknown>  {
    info: grph.NodeInfo;
  };

  export interface xyFuncNodeData extends xyBaseNodeData {
    info: grph.NodeInfo;
    inInfos: grph.SlotInfo[];
    outInfos: grph.SlotInfo[];
    inoutInfos: grph.SlotInfo[];
  };

  export interface xyGraphIoNodeData extends xyBaseNodeData {
    info: grph.NodeInfo;
    slotInfo: grph.SlotInfo;
  };

  export interface xyEdgeData extends Record<string, unknown>  {
    info: grph.EdgeInfo;
  };

  export interface StoredNode {
    id: string;
    rawId: number;
    type: string;
    uri: string;
    position: base.XYPosition;
  };

  // This is a copy of xyflow's Viewport type, to avoid importing
  // from xyflow in non-graph code.
  export interface Viewport {
    x: number;
    y: number;
    zoom: number;
  };

  export type xyNode = Node<xyBaseNodeData, string /* NodeType */>;
  export type xyNodeProps = NodeProps<xyNode>;
  export type xyEdge = Edge<xyEdgeData>;
  export type xyEdgeProps = EdgeProps<xyEdge>;
}
