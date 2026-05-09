import { getContext, setContext } from "svelte";

import type { plinfo } from "@/types/plinfo";
import { type plstate } from "@/types/plstate";
import type { GraphIoManager } from "@/webworkerclient/GraphIoManager";

import { useGraphService } from "../graph-services";

const CONTEXT_KEY = Symbol("nodeCtx");

function parseAssetUriFromEncodedData(encodedData: plstate.EncodedData | null): string | null {
  if (!encodedData?.payload) {
    return null;
  }

  try {
    const parsed = JSON.parse(encodedData.payload) as { assetUri?: unknown };
    return typeof parsed.assetUri === "string" && parsed.assetUri.length > 0 ? parsed.assetUri : null;
  } catch {
    return null;
  }
}

function makeNodeContextOps(nodeInfo: plinfo.NodeInfo) {
  const rawNodeId: number = nodeInfo.rawId;
  const nodeId: string = nodeInfo.alnumid;
  const flowService = useGraphService("flowGraphService");
  const reactiveService = useGraphService("reactiveService");
  const popupService = useGraphService("popupService");
  const graphIo = getContext(Symbol.for("GraphIoManager")) as GraphIoManager;

  return {
    reactiveNodeState: function(): plstate.NodeState {
      return reactiveService.useNodeState(rawNodeId);
    },

    reactiveSlotState: function(slotName: string): plstate.SlotState {
      return reactiveService.useSlotState({ parent: rawNodeId, name: slotName });
    },

    onDeleteSelf: async function(): Promise<void> {
      await flowService!.deleteNodes([nodeId]);
    },

    onSelfInput: async function(encoded: string): Promise<void> {
      await flowService!.setGraphInput(rawNodeId, encoded);
    },

    onGraphInput: async function(dtypeStr: string, ioData: plstate.EncodedData | null, triggerRect: DOMRect): Promise<void> {
      if (nodeInfo.ntype !== "IN") {
        throw new Error("Only IN nodes can have graph input");
      }

      const result = await popupService.encodedDataEditor(rawNodeId, dtypeStr, ioData, triggerRect);
      if (result.status !== "OK") {
        return;
      }
      // TODO: Correct this flow.
      const editedData = result.value as plstate.EncodedData;
      if (editedData === null) {
        throw new Error("Expected graph input editor to return data");
      }
      console.log("Graph input editor closed with result:", dtypeStr, editedData);
      // TODO: Set whole payload.
      await flowService!.setGraphInput(rawNodeId, editedData.payload);      
    },

    onSlotInput: async function(slotInfo: plinfo.SlotInfo, slotState: plstate.SlotState, triggerRect: DOMRect): Promise<void> {
      if (slotInfo.access === "O") {
        throw new Error("Only input and inout slots can have slot input");
      }
      if (slotState.inEdges.length > 0) {
        throw new Error("Cannot enter data. Delete the connection(s) at the input slot and try again.");
      }
      const result = await popupService.encodedDataEditor(rawNodeId, slotInfo.dtype, slotState.encodedData, triggerRect);
      if (result.status !== "OK") {
        return;
      }
      const data = result.value as plstate.EncodedData;
      console.log("Slot input editor closed with result:", slotInfo.dtype, data);
      await flowService!.setSlotInput(rawNodeId, slotInfo.name, data.payload);
    },

    registerPreview: async function (slotInfo: plinfo.SlotInfo, onscreen: HTMLCanvasElement): Promise<string> {
      if (slotInfo.dtype !== "bitmap") {
        throw new Error("Previews are only supported for bitmap data");
      }
      const slotId: plinfo.SlotId = { parent: rawNodeId, name: slotInfo.name };
      const offscreen = onscreen.transferControlToOffscreen() as OffscreenCanvas;
      const { regKey } = await graphIo.registerPreview({ slotId, offscreen });
      return regKey;
    },

    unregisterPreview: async function (regKey: string): Promise<void> {
      await graphIo.unRegisterPreview({ regKey });
    },

    expandPreview: async function(slotId: plinfo.SlotId, encodedData: plstate.EncodedData | null = null): Promise<void> {
      const assetUri: string = nodeInfo.ntype === "IN"
        ? (parseAssetUriFromEncodedData(encodedData) ?? `idb:/artifacts/${slotId.parent}:${slotId.name}`)
        : `idb:/artifacts/${slotId.parent}:${slotId.name}`;
      await popupService.imgViewerModal(assetUri);
    },
  };
}

function setNodeContextOps(nodeInfo: plinfo.NodeInfo): NodeContextOps {
  const nodeOps = makeNodeContextOps(nodeInfo);
  setContext(CONTEXT_KEY, nodeOps);
  return nodeOps;
}

function getNodeContextOps(): NodeContextOps {
  return getContext(CONTEXT_KEY) as NodeContextOps;
}

export type NodeContextOps = ReturnType<typeof makeNodeContextOps>;
export { getNodeContextOps, setNodeContextOps };
