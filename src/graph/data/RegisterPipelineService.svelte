<script lang="ts">
import type { Viewport } from "@xyflow/svelte";
import { getContext } from "svelte";

import type { base } from "@/types/base";
import type { fn } from "@/types/function";
import type { grph } from "@/types/grph";
import type { xy } from "@/types/xy";
import { NodeTemplateUri } from "@/utils/NodeTemplateUri";
import { FlowWorkerApi } from "@/webworkerclient/FlowWorkerApi";
import { GraphWorkerApi } from "@/webworkerclient/GraphWorkerApi";
import { IoWorkerApi } from "@/webworkerclient/IoWorkerApi";

import { registerGraphService, useGraphService } from "../graph-services";

const flow = getContext(FlowWorkerApi.CONTEXT_KEY) as FlowWorkerApi;
const graph = getContext(GraphWorkerApi.CONTEXT_KEY) as GraphWorkerApi;
const io = getContext(IoWorkerApi.CONTEXT_KEY) as IoWorkerApi;

const flowGraphService = useGraphService("flowGraphService");
const reactiveService = useGraphService("reactiveService");

const LOCAL_STORAGE_ENABLED = import.meta.env.VITE_FLAG_ENABLE_LOCAL_STORAGE === "true";
const GRAPH_STORAGE_KEY = "svelte-app:graph-encoded:v1";

interface PersistedGraphDoc {
  version: 1;
  viewport: Viewport;
  savedAt: number;
  meta: xy.StoredGraphMeta;
  nodes: xy.StoredNode[];
  edges: xy.StoredEdge[];
  encoded: { slotId: grph.SlotId; encodedData: grph.EncodedData }[];
}

registerGraphService("pipelineService", _createPipelineService());

function _createPipelineService() {

  async function buildPipeline(): Promise<void> {
    await flow.buildPipeline({});
  }

  async function stepPipeline(): Promise<void> {
    console.time("step-loop");
    while (true) {
      const { stepResult } = await flow.stepPipeline({});
      if (stepResult.status === "PARTIAL" && stepResult.awaitInfos.length > 0) {
        await io.fulfillAwaiters({ awaitInfos: stepResult.awaitInfos });
      } else {
        break;
      }
    }
    console.timeEnd("step-loop");
  }

  async function saveGraphToLocalStorage(): Promise<boolean> {
    if (!LOCAL_STORAGE_ENABLED || typeof window === "undefined") {
      return false;
    }
    if (flowGraphService.allNodes().length === 0) {
      return false;
    }

    const doc = await _makePersistedGraphDoc();
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
    return true;
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
        meta: parsed.meta || { lastNodeId: 0, lastEdgeId: 0 },
        nodes: parsed.nodes,
        edges: parsed.edges || [],
        encoded: parsed.encoded || [],
      };
    } catch (error) {
      console.warn("Failed reading graph from localStorage", error);
      return null;
    }
  }

  async function _restoreGraphFromPipelineDoc(doc: PersistedGraphDoc): Promise<void> {
    if (doc.viewport) {
      flowGraphService.setViewport(doc.viewport);
    }

    const nodesAndUris: Array<{ node: xy.StoredNode; parsed: NodeTemplateUri }> = [];
    const funcUriSet = new Set<string>();

    for (const node of doc.nodes) {
      const parsed = NodeTemplateUri.ParseFromStr(node.uri);
      nodesAndUris.push({ node, parsed });
      if (parsed.getNodeType() === "FN") {
        funcUriSet.add(parsed.getAsFuncUri());
      }
    }

    const usedFuncInfos = await _loadUsedFuncInfos(funcUriSet);
    for (const { node, parsed } of nodesAndUris) {
      const nodeType = parsed.getNodeType();
      if (nodeType === "FN") {
        const funcUri = parsed.getAsFuncUri();
        const funcInfo = usedFuncInfos.get(funcUri)!;
        await flowGraphService.newNodeAt(funcInfo, node.position, node.id);
      } else {
        const isOutput = nodeType === "OUT";
        await flowGraphService.newGraphIOAt(parsed.getDataType(), isOutput, node.position, node.id);
      }
    }

    const edgeEntries: { source: grph.EncodedSlotId; target: grph.EncodedSlotId; overrideEdgeId: number }[] = [];
    for (const edge of doc.edges) {
      const source: grph.EncodedSlotId = { parent: edge.n0, name: edge.s0 };
      const target: grph.EncodedSlotId = { parent: edge.n1, name: edge.s1 };
      edgeEntries.push({ source, target, overrideEdgeId: edge.id });
    }
    await flowGraphService.addEdges(edgeEntries);
    const lastNodeId = doc.meta?.lastNodeId ?? 0;
    const lastEdgeId = doc.meta?.lastEdgeId ?? 0;
    await graph.setGraphMeta({ lastNodeId, lastEdgeId });  

    for (const { slotId, encodedData } of doc.encoded) {
      // TODO: Batch these calls.
      await flowGraphService.setSlotInput(slotId.parent, slotId.name, encodedData.payload);
      const slotState = $state.snapshot(reactiveService.useSlotState(slotId));
      slotState.encodedData = encodedData;
      reactiveService.setSlotState(slotId, slotState);
    }
  }

  return {
    buildPipeline,
    stepPipeline,
    saveGraphToLocalStorage,
    restoreGraphFromLocalStorage,
  };
}

async function _makePersistedGraphDoc(): Promise<PersistedGraphDoc> {
  const { lastNodeId, lastEdgeId } = await graph.getGraphMeta({});

  const now = Date.now();

  const xyNodes = flowGraphService.allNodes();
  const nodes: xy.StoredNode[] = [];

  const encodedEntries: { slotId: grph.SlotId; encodedData: grph.EncodedData }[] = [];
  for (const node of xyNodes) {
    const slotInfos: grph.SlotInfo[] = [];
    if (node.type === "function") {
      const nodeData = node.data as xy.xyFuncNodeData;
      slotInfos.push(...nodeData.inInfos, ...nodeData.outInfos, ...nodeData.inoutInfos);
    } else {
      const nodeData = node.data as xy.xyGraphIoNodeData;
      slotInfos.push(nodeData.slotInfo);
    }

    slotInfos.forEach((slotInfo: grph.SlotInfo) => {
      const slotId: grph.SlotId = { parent: slotInfo.parent, name: slotInfo.name };
      const slotState = $state.snapshot(reactiveService.useSlotState(slotId));
      if (slotState.encodedData === null) return;
      encodedEntries.push({ slotId, encodedData: slotState.encodedData });
    });

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
    nodes.push(storedNode);
  }

  const xyEdges = flowGraphService.allEdges();
  const edges: xy.StoredEdge[] = [];
  for (const edge of xyEdges) {
    const edgeInfo = edge.data!.info;
    const storedEdge: xy.StoredEdge = {
      id: edgeInfo.id,
      n0: edge.source,
      s0: edgeInfo.slot0!,
      n1: edge.target,
      s1: edgeInfo.slot1!,
    };
    edges.push(storedEdge);
  }

  return {
    version: 1,
    viewport: flowGraphService.getViewport(),
    savedAt: now,
    meta: { lastNodeId, lastEdgeId },
    nodes,
    edges,
    encoded: encodedEntries,
  };
}

async function _loadUsedFuncInfos(nodeUris: Set<string>): Promise<Map<string /* uri */, fn.FunctionInfo>> {
  const resp = await graph.getAvailableFuncs({
    filters: ["URI_LIST"],
    uriList: Array.from(nodeUris),
  });
  console.log("Available funcs response:", resp);

  const usedFuncInfos: Map<string /* uri */, fn.FunctionInfo> = new Map();
  nodeUris.forEach((fnUri) => {
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