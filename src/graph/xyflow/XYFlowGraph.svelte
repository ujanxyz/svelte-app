<script lang="ts">
import {
  Background,
  BackgroundVariant,
  ControlButton,
  Controls,
  SvelteFlow,
  SvelteFlowProvider,
} from "@xyflow/svelte";
import { initialNodes, initialEdges } from "./nodes-and-edges";
import { type Edge, type Node } from "@xyflow/svelte";
import "@xyflow/svelte/dist/style.css";
import "./xyflow.css";
import DefaultNode from "../nodes/DefaultNode.svelte";
import RegisterXYMenus from "./RegisterXYMenus.svelte";
import useXYMenus from "./useXYMenus";
import RegisterXYGalleries from "./RegisterXYGalleries.svelte";
import RegisterEventHandlers from "./RegisterEventHandlers.svelte";
import InputNode from "../nodes/InputNode.svelte";

const nodeTypes = {
  in: InputNode,
  default: DefaultNode,
};

const {
  onpanecontextmenu,
  onnodecontextmenu,
  onedgecontextmenu,
  onselectioncontextmenu,
  openGallery,
} = useXYMenus();

let nodes = $state.raw<Node[]>(initialNodes);
let edges = $state.raw<Edge[]>(initialEdges);
</script>

<SvelteFlowProvider>
  <SvelteFlow
    bind:nodes={nodes}
    bind:edges={edges}
    nodeTypes={nodeTypes}
    onpanecontextmenu={onpanecontextmenu}
    onnodecontextmenu={onnodecontextmenu}
    onedgecontextmenu={onedgecontextmenu}
    onselectioncontextmenu={onselectioncontextmenu}
    fitView
    colorMode={"dark"}
  >
    <Background
      variant={BackgroundVariant.Dots}
      gap={5}
      patternClass={"dots"}
      size={0.6}
    />
    <Controls position={"top-right"}>
      <ControlButton onclick={() => openGallery()}>⚡️</ControlButton>
    </Controls>
  </SvelteFlow>
  <RegisterXYMenus />
  <RegisterXYGalleries />
  <RegisterEventHandlers />
</SvelteFlowProvider>

<style>
</style>
