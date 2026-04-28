import {
  type Connection,
  type Edge,
  type Node,
  type Viewport,
  type XYPosition,
} from "@xyflow/svelte";

import type { fn } from "@/types/function";
import type { plinfo } from "@/types/plinfo";
import type { plstate } from "@/types/plstate";
import type { xy } from "@/types/xy";

import type { ClientXY, StatusOr } from "../overlay/types";
import { createReactiveContext } from "../utils/reactive-context.svelte";
import type { UjGraphStorage } from "./types";

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
  setNodeState(rawNodeId: number, state: plstate.NodeState): void;
  useNodeState(rawNodeId: number): plstate.NodeState;
  setSlotState(slotId: plinfo.SlotId, state: plstate.SlotState): void;
  useSlotState(slotId: plinfo.SlotId): plstate.SlotState;
  deleteSlots(slotIds: plinfo.SlotId[]): void;
}

interface IoService {
  uploadFile: (rawNodeId: number, slotName: string, file: File) => Promise<void>;

  serializeObject: (
    nodes: Node[],
    edges: Edge[],
    viewport: Viewport,
  ) => UjGraphStorage;
}

interface FlowGraphService {
  // Status: Done, Tested.
  newNodeAt(fnSpec: fn.FunctionInfo, position: XYPosition): Promise<void>;
  newGraphIOAt(dtype: string, isOutput: boolean, position: XYPosition): Promise<void>;

  // Status: Done, Tested.
  validateEdge(connection: Connection): Promise<plstate.SlotValidity>;
  addEdge(connection: Connection): Promise<void>;

  // Status: Done, Tested.
  deletionHandle(nodes: xy.xyNode[], edges: xy.xyEdge[]): Promise<void>;

  screenToFlowXY: (input: MouseEvent | ClientXY) => XYPosition;
  allNodes: () => Node[];
  allEdges: () => Edge[];
  deleteNodes: (nodeIds: string[]) => Promise<void>;
  deleteEdges: (edgeIds: string[]) => Promise<void>;
  deleteAllEdges: () => Promise<void>;
  deleteGraph: () => Promise<void>;
  assignGraph: (newNodes: Node[], newEdges: Edge[]) => void;
  setGraphInput: (rawNodeId: number, encoded: string) => Promise<void>;
  setSlotInput: (rawNodeId: number, slotName: string, encoded: string) => Promise<void>;
  playPipeline: () => Promise<void>;
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
  nodeTemplateGallery: (ntype: plinfo.NodeInfo["ntype"]) => Promise<StatusOr<fn.FunctionInfo | fn.GraphIoInfo>>;
  flowDataInspector: () => Promise<void>;
  encodedDataEditor: (rawNodeId: number, dtypeStr: string, priorIoData: plstate.EncodedData | null, triggerRect: DOMRect)
      => Promise<StatusOr<plstate.EncodedData>>;
}

export interface GraphServices {
  rawStoreService?: RawStoreService;
  ioService?: IoService;
  flowGraphService?: FlowGraphService;
  menuService?: ContextMenuService;
  popupService?: PopupService;
  reactiveService?: ReactiveService;
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
