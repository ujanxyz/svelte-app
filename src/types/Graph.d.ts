interface IGraphNode {
    id: string;
    label: string;
    ins: string[];
    outs: string[];
};

interface IGraphEdge {
    id: string;
    src: string;
    srcSlot: string;
    dst: string;
    dstSlot: string;
};

interface IGraph {
    id: string;
    label: string;
    nodes: IGraphNode[];
    edges: IGraphEdge[];
};

export type { IGraph, IGraphNode, IGraphEdge };
