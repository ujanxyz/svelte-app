/**
 * plinfo: Pipeline info
 * Fixed information for pipeline elements, node, edge, slot etc.
 */
export namespace plinfo {
  /**
   * See C++ repo -> ujcore::plinfo::SlotId
   */
  export interface SlotId {
    parent: number;
    name: string;
  };

  /**
   * See C++ repo -> ujcore::plinfo::SlotInfo
   */
  export interface SlotInfo {
    parent: number;
    name: string;
    dtype: string;
    access: "I" | "O" | "M";
  };

  /**
   * See C++ repo -> ujcore::plinfo::NodeInfo
   */
  export interface NodeInfo {
    rawId: number;
    alnumid: string;
    fnuri: string;
    // Slot names.
    ins: string[];
    outs: string[];
    inouts: string[];
  };

  /**
   * See C++ repo -> ujcore::plinfo::GraphEdge
   */
  export interface EdgeInfo {
    id: number;
    catid: string;
    node0: number;
    node1: number;
    slot0: string;
    slot1: string;
  };
}