import {
  useEdges,
  useNodes,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/svelte";
import { initialEdges, initialNodes } from "../xyflow/nodes-and-edges";

class GraphService {
  public static CONTEXT_KEY: string = "GraphService";

  private _nodes = $state.raw<Node[]>(initialNodes);
  private _edges = $state.raw<Edge[]>(initialEdges);

  private readonly updateNodes: (updateFn: (nodes: Node[]) => Node[]) => void;
  private readonly updateEdges: (updateFn: (edges: Edge[]) => Edge[]) => void;

  public constructor() {
    const {
      current: currentNodes,
      update: updateNodes,
      set: setNodes,
    } = useNodes();
    const { update: updateEdges } = useEdges();
    this.updateNodes = updateNodes;
    this.updateEdges = updateEdges;
  }

  public get bindableNodes(): Node[] {
    return this._nodes;
  }

  public set bindableNodes(value: Node[]) {
    this._nodes = value;
  }

  public get bindableEdges(): Edge[] {
    return this._edges;
  }

  public set bindableEdges(value: Edge[]) {
    this._edges = value;
  }

  public addNode(newNode: Node): void {
    this.updateNodes((nodes: Node[]) => {
      return [...nodes, newNode];
    });
  }

  public rmNode(nodeId: string): void {
    this.updateNodes((nodes: Node[]) => {
      return nodes.filter((n: Node) => n.id !== nodeId);
    });
  }

  public rmNodes(nodeIds: string[]): void {
    const lookup = new Set<string>(nodeIds);
    this.updateNodes((nodes: Node[]) => {
      return nodes.filter((n: Node) => !lookup.has(n.id));
    });
  }

  public rmEdge(egeId: string): void {
    this.updateEdges((edges: Edge[]): Edge[] => {
      return edges.filter((e: Edge) => e.id !== egeId);
    });
  }
}

export default GraphService;
