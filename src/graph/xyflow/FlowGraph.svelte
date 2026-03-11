<script lang="ts">
import { type Component } from "svelte";
import {
  Background,
  BackgroundVariant,
  ControlButton,
  Controls,
  SvelteFlow,
  type Edge,
  type Node,
} from "@xyflow/svelte";
import DefaultNode from "../nodes/DefaultNode.svelte";
import useMenusAndPopups from "./useMenusAndPopups";
import InputNode from "../nodes/InputNode.svelte";
import DefaultEdge from "../edges/DefaultEdge.svelte";
import useDebugActions from "./useDebugActions";
import type { UjEdgeProps, UjNodeProps } from "../types";
import "@xyflow/svelte/dist/style.css";
import "./xyflow.css";
// Icons
import FunctionIcon from "phosphor-svelte/lib/FunctionIcon";
import PlayIcon from "phosphor-svelte/lib/PlayIcon";
import { initialEdges, initialNodes } from "./nodes-and-edges";

const nodeTypes: Record<string, Component<UjNodeProps>> = {
  in: InputNode,
  default: DefaultNode,
};

const edgeTypes: Record<string, Component<UjEdgeProps>> = {
  default: DefaultEdge,
};

let _nodes = $state.raw<Node[]>(initialNodes);
let _edges = $state.raw<Edge[]>(initialEdges);

const {
  onpanecontextmenu,
  onnodecontextmenu,
  onedgecontextmenu,
  onselectioncontextmenu,
  onconnectend,
  onpopupgallery,
} = useMenusAndPopups();

const {
  isValidConnection,
  onbeforeconnect,
  onconnect,
  onconnectstart,
  // onconnectend,
  ondelete,
  onpaneclick,
} = useDebugActions();
</script>

<SvelteFlow
  bind:nodes={_nodes}
  bind:edges={_edges}
  {nodeTypes}
  {edgeTypes}
  {onpanecontextmenu}
  {onnodecontextmenu}
  {onedgecontextmenu}
  {onselectioncontextmenu}
  fitView
  colorMode={"dark"}
  // Debug actions:
  {isValidConnection}
  {onbeforeconnect}
  {onconnect}
  {onconnectstart}
  {onconnectend}
  {ondelete}
  {onpaneclick}
  multiSelectionKey={null}
>
  <Background
    variant={BackgroundVariant.Dots}
    gap={5}
    patternClass={"dots"}
    size={0.75}
  />
  <Controls position={"top-right"}>
    <ControlButton onclick={onpopupgallery}>
      <FunctionIcon />
    </ControlButton>
    <ControlButton onclick={onpopupgallery}>
      <PlayIcon />
    </ControlButton>
  </Controls>
</SvelteFlow>

<style>
</style>
