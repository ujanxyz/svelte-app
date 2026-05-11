<script lang="ts">
import type { Edge, Node, Viewport, XYPosition } from "@xyflow/svelte";
import { getContext } from "svelte";

import type { base } from "@/types/base";
import type { xy } from "@/types/xy";
import type { GraphIoManager } from "@/webworkerclient/GraphIoManager";
import type { PipelineBuilder } from "@/webworkerclient/PipelineBuilder";

import { registerGraphService, useGraphService } from "../graph-services";
import type { fn } from "@/types/function";

const pipeline = getContext(Symbol.for("PipelineBuilder")) as PipelineBuilder;
const io = getContext(Symbol.for("GraphIoManager")) as GraphIoManager;

const flowGraphService = useGraphService("flowGraphService");
const reactiveService = useGraphService("reactiveService");

const LOCAL_STORAGE_ENABLED = import.meta.env.VITE_FLAG_ENABLE_LOCAL_STORAGE === "true";
const GRAPH_STORAGE_KEY = "svelte-app:graph-encoded:v1";

interface PersistedGraphDoc {
  version: 1;
  viewport: Viewport;
  savedAt: number;
  nodes: xy.StoredNode[];
}

registerGraphService("pipelineService", _createPipelineService());

function _createPipelineService() {
  async function playPipeline(): Promise<void> {
    console.log("Playing pipeline...");
    const { assetInfos } = await pipeline.buildPipeline({});
    console.log("[DONE] buildPipeline done, asset infos:", assetInfos);
    await io.stageAssets({ isPostRun: false, assetInfos });

    await pipeline.runPipeline({});
    const resources = await pipeline.getResources({});
    console.log("Resources after run:", resources);
  }

  async function saveGraphToLocalStorage(): Promise<boolean> {
    if (!LOCAL_STORAGE_ENABLED || typeof window === "undefined") {
      return false;
    }
    if (flowGraphService.allNodes().length === 0) {
      return false;
    }

    const doc = _makePersistedGraphDoc();
    try {
      localStorage.setItem(GRAPH_STORAGE_KEY, JSON.stringify(doc));
      console.log("Graph persisted to localStorage");
      return true;
    } catch (error) {
      console.warn("Failed to persist graph to localStorage", error);
      return false;
    }
  }

  async function restoreGraphFromLocalStorage(): Promise<boolean> {
    if (!LOCAL_STORAGE_ENABLED || typeof window === "undefined") {
      return false;
    }

    const doc = _readStoredGraphDoc();
    if (!doc) return false;

    console.log("Restoring graph from localStorage, doc:", doc);
    await _restoreGraphFromPipelineDoc(doc);
    console.log("Restoring done !");
    return false;
  }

  function _readStoredGraphDoc(): PersistedGraphDoc | null {
    try {
      const raw = localStorage.getItem(GRAPH_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<PersistedGraphDoc>;
      if (!parsed.viewport || !parsed.nodes || !Array.isArray(parsed.nodes)) {
        return null;
      }
      return {
        version: parsed.version === 1 ? 1 : 1,
        viewport: parsed.viewport,
        savedAt: typeof parsed.savedAt === "number" ? parsed.savedAt : 0,
        nodes: parsed.nodes,
      };
    } catch (error) {
      console.warn("Failed reading graph from localStorage", error);
      return null;
    }
  }

  async function _restoreGraphFromPipelineDoc(doc: PersistedGraphDoc): Promise<void> {
    // await pipeline.decodeGraph(doc.encodedGraph);
    // await _syncGraphFromPipeline();
    if (doc.viewport) {
      flowGraphService.setViewport(doc.viewport);
    }

    const usedFuncInfos = await _loadUsedFuncInfos(doc.nodes);
    for (const node of doc.nodes) {
      const funcInfo = usedFuncInfos.get(node.uri);
      flowGraphService.newNodeAt(funcInfo!, node.position);
    }
    console.log("Used func infos needed for graph restore:", usedFuncInfos);
  }

  return {
    playPipeline,
    saveGraphToLocalStorage,
    restoreGraphFromLocalStorage,
  };
}

function _makePersistedGraphDoc(): PersistedGraphDoc {
  const now = Date.now();

  const xyNodes = flowGraphService.allNodes();
  const nodes: xy.StoredNode[] = [];
  for (const node of xyNodes) {
    const position: base.XYPosition = {
      x: Number.parseFloat(node.position.x.toPrecision(2)),
      y: Number.parseFloat(node.position.y.toPrecision(2)),
    };
    const storedNode: xy.StoredNode = {
      id: node.id,
      rawId: node.data.info.rawId,
      type: node.type,
      position,
      uri: node.data.info.uri,
    };
    console.log(`StoredNode ${node.id}:`, storedNode);
    nodes.push(storedNode);
  }

  return {
    version: 1,
    viewport: flowGraphService.getViewport(),
    savedAt: now,
    nodes,
  };
}

async function _loadUsedFuncInfos(nodes: xy.StoredNode[]): Promise<Map<string /* uri */, fn.FunctionInfo>> {
  const nodeUris = new Set<string>();
  nodes.forEach((storedNode: xy.StoredNode) => {
    nodeUris.add(storedNode.uri);
  });
  const resp = await pipeline.getAvailableFuncs({
    filters: ["URI_LIST"],
    uriList: Array.from(nodeUris),
  });
  console.log("Available funcs response:", resp);

  const usedFuncInfos: Map<string /* uri */, fn.FunctionInfo> = new Map();
  nodes.forEach((storedNode: xy.StoredNode) => {
    const fnUri = storedNode.uri;
    if (usedFuncInfos.has(fnUri)) {
      // Already found info for this URI, skip.
      return;
    }
    const funcInfo = resp.infos.find((info: fn.FunctionInfo) => info.uri === fnUri);
    if (!funcInfo) {
      throw new Error(`Func URI ${fnUri} from stored graph not found in available funcs`);
    }
    usedFuncInfos.set(fnUri, funcInfo);
  });

  return usedFuncInfos;
}

</script>