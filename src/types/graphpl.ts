import type {
  Edge,
  EdgeProps,
  Node,
  NodeProps,
  Viewport,
  XYPosition,
} from "@xyflow/svelte";

/**
 * Types in the node pipeline.
 */
export namespace graphpl {

  /**
   * See C++ repo -> ujcore::data::GraphNode
   */
  export interface GraphNode {
    id: number;
    alnumid: string;
    label: string;
    fnuri: string;
    slots: string[];
  };

  /**
   * See C++ repo -> ujcore::data::GraphEdge
   */
  export interface GraphEdge {
    id: number;
    node0: number;
    node1: number;
    slot0: string;
    slot1: string;
  };

  /**
   * See C++ repo -> ujcore::data::GraphSlot
   */
  export interface GraphSlot {
    parent: number;
    name: string;
    dtype: string;
    isoutput: boolean;
    modified: number;
  };

  export interface GraphNode {

  }

  // export type UjNode = Node<GraphNode>;
  // export type UjNodeProps = NodeProps<UjNode>;
  // export type UjEdge = Edge<UjEdgeData>;
  // export type UjEdgeProps = EdgeProps<UjEdge>;
}