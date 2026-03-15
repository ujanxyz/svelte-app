import { type Edge, type Node, type XYPosition } from "@xyflow/svelte";

import type { FuncSpec } from "@/modules/fngallery/types";

import type { ClientXY, StatusOr } from "../overlay/types";
import { createReactiveContext } from "../utils/reactive-context.svelte";
import type { UjGraphStorage } from "./types";

export type MenuFunction = (clientXY: ClientXY) => Promise<StatusOr<string>>;
export type PickFunction = () => Promise<StatusOr<string>>;

interface RawStoreService {
  // List of nodes.
  get nodes(): Node[];
  set nodes(value: Node[]);
  // List of edges.
  get edges(): Edge[];
  set edges(value: Edge[]);
  // Pivot: last clicked XY position in the pane.
  get pivot(): XYPosition;
  set pivot(value: XYPosition);
}

interface IoService {
  createNodeAt: (fnSpec: FuncSpec, position: XYPosition) => Node;
  serializeObject: (nodes: Node[], edges: Edge[]) => UjGraphStorage;
}

interface ContextMenuService {
  menuInPane: MenuFunction;
  menuInNode: MenuFunction;
  menuInEdge: MenuFunction;
  menuInSelection: MenuFunction;
  menuInConnEnd: MenuFunction;
}

interface GalleryService {
  pickFnFromGallery: PickFunction;
}

interface FlowGraphService {
  screenToFlowXY: (event: MouseEvent) => XYPosition;
  allNodes: () => Node[];
  allEdges: () => Edge[];
  deleteNode: (nodeId: string) => Promise<void>;
  deleteNodes: (nodeIds: string[]) => Promise<void>;
  deleteEdge: (edgeId: string) => Promise<void>;
  deleteEdges: (edgeIds: string[]) => Promise<void>;
  appendNode: (newNode: Node) => Promise<void>;
  populateGraph: (newNodes: Node[], newEdges: Edge[]) => void;
}

export interface GraphServices {
  rawStoreService?: RawStoreService;
  ioService?: IoService;
  menuService?: ContextMenuService;
  galleryService?: GalleryService;
  flowGraphService?: FlowGraphService;
}

const graphContext = createReactiveContext<GraphServices>(
  Symbol("graph-services"),
);

function provideGraphContext(): void {
  graphContext.provide();
}

function registerGraphService<K extends keyof GraphServices>(
  key: K,
  service: NonNullable<GraphServices[K]>,
) {
  // TODO: Throw if already registered.
  return graphContext.registerService(key, service);
}

function useGraphService<K extends keyof GraphServices>(
  key: K,
): NonNullable<GraphServices[K]> {
  const graphServices = graphContext.getServices();
  // TODO: Throw if not found.
  return graphServices[key] as NonNullable<GraphServices[K]>;
}

export { provideGraphContext, registerGraphService, useGraphService };
