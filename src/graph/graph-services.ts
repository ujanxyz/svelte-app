import { getContext } from "svelte";
import type { ClientXY, StatusOr } from "../overlay/types";
import { createReactiveContext } from "../utils/reactive-context.svelte";
import type { Edge, Node } from "@xyflow/svelte";

export type MenuFunction = (clientXY: ClientXY) => Promise<StatusOr<string>>;
export type PickFunction = () => Promise<StatusOr<string>>;

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
  deleteNode: (nodeId: string) => Promise<void>;
  deleteNodes: (nodeIds: string[]) => Promise<void>;
  deleteEdge: (edgeId: string) => Promise<void>;
  appendNode: (newNode: Node) => Promise<void>;
}

export interface GraphServices {
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
): void {
  // TODO: Throw if already registered.
  graphContext.registerService(key, service);
}

function useGraphService<K extends keyof GraphServices>(
  key: K,
): NonNullable<GraphServices[K]> {
  const graphServices = graphContext.getServices();
  // TODO: Throw if not found.
  return graphServices[key] as NonNullable<GraphServices[K]>;
}

export { provideGraphContext, registerGraphService, useGraphService };
