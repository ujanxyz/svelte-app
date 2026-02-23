import { useNodes, type Edge, type Node } from "@xyflow/svelte";
import { getContext, setContext } from "svelte";


interface GraphOps {
    addNodes(nodes: Node[]): void;
    rmNode(nodeId: string): void
}

const CONTEXT_KEY: Symbol = Symbol("grphops");

function _makeGraphOps(): GraphOps {
    const {current, update, set} = useNodes();

    function addNodes(nodes: Node[]): void {
        update((_nodes: Node[]) => {
            return [..._nodes, ...nodes];
        });
    }

    function rmNode(nodeId: string): void {
        update((_nodes: Node[]) => {
            return _nodes.filter((n: Node) => n.id !== nodeId);
        });
    }

    return {addNodes, rmNode};
}

function useGraphOps(): GraphOps {
    return _makeGraphOps();
}

export default useGraphOps;
