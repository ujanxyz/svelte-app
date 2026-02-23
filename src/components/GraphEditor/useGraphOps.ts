import { useEdges, useNodes, type Edge, type Node } from "@xyflow/svelte";

interface GraphOps {
    addNode(node: Node): void;
    rmNode(nodeId: string): void;
    rmEdge(egeId: string): void;
}

function _makeGraphOps(): GraphOps {
    const {current: currentNodes, update: updateNodes, set: setNodes} = useNodes();
    const {update: updateEdges} = useEdges();

    function addNode(newNode: Node): void {
        updateNodes((nodes: Node[]) => {
            return [...nodes, newNode];
        });
    }

    function rmNode(nodeId: string): void {
        updateNodes((nodes: Node[]) => {
            return nodes.filter((n: Node) => n.id !== nodeId);
        });
    }

    function rmEdge(egeId: string): void {
        updateEdges((edges: Edge[]): Edge[] => {
            return edges.filter((e: Edge) => e.id !== egeId);
        });
    }

    return {addNode, rmNode, rmEdge};
}

function useGraphOps(): GraphOps {
    return _makeGraphOps();
}

export default useGraphOps;
