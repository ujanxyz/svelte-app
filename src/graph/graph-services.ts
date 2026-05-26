import {
  type Connection,
  type Edge,
  type Node,
  type Viewport,
  type XYPosition,
} from "@xyflow/svelte";

import type { base } from "@/types/base";
import type { fn } from "@/types/function";
import type { grph } from "@/types/grph";
import type { xy } from "@/types/xy";

import { createReactiveContext } from "../utils/reactive-context.svelte";

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

interface ReactiveService {
  setNodeState(nodeId: string, state: grph.NodeState): void;
  useNodeState(nodeId: string): grph.NodeState;
  setSlotState(slotId: grph.EncodedSlotId, state: grph.SlotState): void;
  useSlotState(slotId: grph.EncodedSlotId): grph.SlotState;
  deleteSlots(slotIds: grph.EncodedSlotId[]): void;
}

interface FlowGraphService {
  // Status: Done, Tested.
  newNodeAt(fnSpec: fn.FunctionInfo, position: XYPosition, overrideId: string | null): Promise<void>;
  newGraphIOAt(dtype: string, isOutput: boolean, position: XYPosition, overrideId: string | null): Promise<void>;

  // Status: Done, Tested.
  validateEdge(connection: Connection): Promise<grph.SlotValidity>;
  addEdges(entries: { source: grph.EncodedSlotId; target: grph.EncodedSlotId; overrideEdgeId?: number }[]): Promise<void>;

  // Status: Done, Tested.
  deletionHandle(nodes: xy.xyNode[], edges: xy.xyEdge[]): Promise<void>;

  screenToFlowXY: (input: MouseEvent | base.XYPosition) => XYPosition;
  allNodes: () => xy.xyNode[];
  allEdges: () => xy.xyEdge[];
  deleteNodes: (nodeIds: string[]) => Promise<void>;
  deleteEdges: (edgeIds: string[]) => Promise<void>;
  deleteAllEdges: () => Promise<void>;
  deleteGraph: () => Promise<void>;
  assignGraph: (newNodes: Node[], newEdges: Edge[]) => void;
  setGraphInput: (nodeId: string, encoded: string) => Promise<void>;
  setSlotInput: (nodeId: string, slotName: string, encoded: string) => Promise<void>;

  getViewport(): xy.Viewport;
  setViewport(viewport: xy.Viewport): void;
}

interface PipelineService {
  buildPipeline: () => Promise<void>;
  stepPipeline: () => Promise<void>;
  saveGraphToLocalStorage: () => Promise<boolean>;
  restoreGraphFromLocalStorage: () => Promise<boolean>;
}

type MenuFunction = (clientXY: base.XYPosition) => Promise<base.StatusOr<string>>;

interface PopupService {
  mediaManagerModal: () => Promise<void>;
  imgViewerModal: (assetUri: string) => Promise<void>;
  nodeTemplateGallery: (ntype: grph.NodeInfo["ntype"]) => Promise<base.StatusOr<fn.FunctionInfo | fn.GraphIoInfo>>;
  encodedDataEditor: (rawNodeId: number, dtypeStr: string, priorIoData: grph.EncodedData | null, triggerRect: DOMRect)
      => Promise<base.StatusOr<grph.EncodedData>>;

  // Context menu APIs.
  menuInPane: MenuFunction;
  menuInNode: MenuFunction;
  menuInEdge: MenuFunction;
  menuInSelection: MenuFunction;
  menuInConnEnd: MenuFunction;
}

export interface GraphServices {
  rawStoreService?: RawStoreService;
  reactiveService?: ReactiveService;
  flowGraphService?: FlowGraphService;
  popupService?: PopupService;
  pipelineService?: PipelineService;
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

export type GraphServiceType<K extends keyof GraphServices> = NonNullable<GraphServices[K]>;

export { provideGraphContext, registerGraphService, useGraphService };
