import { type Edge, type Node, type Viewport, type XYPosition } from "@xyflow/svelte";

import type { FuncSpec } from "@/modules/fngallery/types";

import type { ClientXY, StatusOr } from "../overlay/types";
import { createReactiveContext } from "../utils/reactive-context.svelte";
import type { UjGraphStorage, UjOverrideData, UjSlotInfo } from "./types";

interface RawStoreService {
  // List of nodes.
  get nodes(): Node[];
  set nodes(value: Node[]);
  // List of edges.
  get edges(): Edge[];
  set edges(value: Edge[]);
  // Use provided store for center and zoom level.
  get viewport(): Viewport;
  set viewport(value: Viewport);
  // Pivot: last clicked XY position in the pane.
  get pivot(): XYPosition;
  set pivot(value: XYPosition);

  currentViewport(): Viewport;
}

interface SlotService {
  // TODO: Rename reactiveSlotInfo.
  useSlotInfo(nodeId: string, paramName: string): UjSlotInfo | undefined;
  reactiveSlotEntries(): [string, UjSlotInfo][];
  setOverride(
      nodeId: string,
      slotName: string,
      override: boolean,
      data: UjOverrideData | null): void;
  lookupOverride(
    nodeId: string,
    slotName: string,
  ): UjOverrideData | null;
  deleteElements(nodes: Node[], edges: Edge[]): void;
  ensureSlots(nodes: Node[]): void;
  ensureConnections(edges: Edge[]): void;
}

interface IoService {
  createNodeAt: (fnSpec: FuncSpec, position: XYPosition) => Node;
  serializeObject: (nodes: Node[], edges: Edge[], viewport: Viewport) => UjGraphStorage;
}


interface FlowGraphService {
  screenToFlowXY: (input: MouseEvent | ClientXY) => XYPosition;
  allNodes: () => Node[];
  allEdges: () => Edge[];
  deleteNode: (nodeId: string) => Promise<void>;
  deleteNodes: (nodeIds: string[]) => Promise<void>;
  deleteEdge: (edgeId: string) => Promise<void>;
  deleteEdges: (edgeIds: string[]) => Promise<void>;
  deleteAllEdges: () => Promise<void>;
  deleteGraph: () => Promise<void>;
  appendNode: (newNode: Node) => Promise<void>;
  assignGraph: (newNodes: Node[], newEdges: Edge[]) => void;
}

type MenuFunction = (clientXY: ClientXY) => Promise<StatusOr<string>>;

interface ContextMenuService {
  menuInPane: MenuFunction;
  menuInNode: MenuFunction;
  menuInEdge: MenuFunction;
  menuInSelection: MenuFunction;
  menuInConnEnd: MenuFunction;
}

interface PopupService {
  nodeFunctionGallery: () => Promise<StatusOr<string>>;
  flowDataInspector: () => Promise<void>;
}

export interface GraphServices {
  rawStoreService?: RawStoreService;
  slotService?: SlotService;
  ioService?: IoService;
  flowGraphService?: FlowGraphService;
  menuService?: ContextMenuService;
  popupService?: PopupService;
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
