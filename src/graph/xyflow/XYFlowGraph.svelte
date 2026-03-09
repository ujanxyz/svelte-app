<script lang="ts">
import {
  Background,
  BackgroundVariant,
  ControlButton,
  Controls,
  SvelteFlow,
} from "@xyflow/svelte";
import "@xyflow/svelte/dist/style.css";
import DefaultNode from "../nodes/DefaultNode.svelte";
import useXYMenus from "./useXYMenus";
import InputNode from "../nodes/InputNode.svelte";
import { initialNodes, initialEdges } from "./nodes-and-edges";
import type { Edge, Node } from "@xyflow/svelte";
import "./xyflow.css";
// Icons
import FunctionIcon from "phosphor-svelte/lib/FunctionIcon";
import PlayIcon from "phosphor-svelte/lib/PlayIcon";

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

function dummyselectionctx() {
  console.log("dummyselectionctx ==== >");
}
</script>

<SvelteFlow
  bind:nodes={nodes}
  bind:edges={edges}
  nodeTypes={nodeTypes}
  onpanecontextmenu={onpanecontextmenu}
  onnodecontextmenu={onnodecontextmenu}
  onedgecontextmenu={onedgecontextmenu}
  onselectioncontextmenu={() => dummyselectionctx()}
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
    <ControlButton onclick={() => openGallery()}>
      <FunctionIcon/>
    </ControlButton>
    <ControlButton onclick={() => openGallery()}>
      <PlayIcon/>
    </ControlButton>
  </Controls>
</SvelteFlow>

<style>
</style>
