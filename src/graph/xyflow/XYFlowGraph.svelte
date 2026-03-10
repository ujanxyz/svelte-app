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
import useMenusAndPopups from "./useMenusAndPopups";
import InputNode from "../nodes/InputNode.svelte";
import { initialNodes, initialEdges } from "./nodes-and-edges";
import type { Component } from "svelte";
import type { Edge, EdgeProps, Node, NodeProps } from "@xyflow/svelte";
import "./xyflow.css";
// Icons
import FunctionIcon from "phosphor-svelte/lib/FunctionIcon";
import PlayIcon from "phosphor-svelte/lib/PlayIcon";
import DefaultEdge from "../edges/DefaultEdge.svelte";
import GraphService from "../data/GraphService.svelte";

const nodeTypes: Record<string, Component<NodeProps>> = {
  in: InputNode,
  default: DefaultNode,
};

const edgeTypes: Record<string, Component<EdgeProps>> = {
  default: DefaultEdge,
};

const {
  onpanecontextmenu,
  onnodecontextmenu,
  onedgecontextmenu,
  onselectioncontextmenu,
  onpopupgallery,
} = useMenusAndPopups();

const graph = new GraphService();

// let nodes = $state.raw<Node[]>(initialNodes);
// let edges = $state.raw<Edge[]>(initialEdges);

</script>

<SvelteFlow
  bind:nodes={graph.bindableNodes}
  bind:edges={graph.bindableEdges}
  {nodeTypes} {edgeTypes}
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
    <ControlButton onclick={onpopupgallery}>
      <FunctionIcon/>
    </ControlButton>
    <ControlButton onclick={onpopupgallery}>
      <PlayIcon/>
    </ControlButton>
  </Controls>
</SvelteFlow>

<style>
</style>
