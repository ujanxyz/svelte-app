import { useNodes, type Edge, type Node } from "@xyflow/svelte";

interface GraphOps {
    addNode(node: Node): void;
    rmNode(nodeId: string): void
}

function _makeGraphOps(): GraphOps {
    const {current, update, set} = useNodes();

    function addNode(node: Node): void {
        update((_nodes: Node[]) => {
            return [..._nodes, node];
        });
    }

    function rmNode(nodeId: string): void {
        update((_nodes: Node[]) => {
            return _nodes.filter((n: Node) => n.id !== nodeId);
        });
    }

    return {addNode, rmNode};
}

function useGraphOps(): GraphOps {
    return _makeGraphOps();
}

export default useGraphOps;
