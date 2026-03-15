<script lang="ts">
import "@xyflow/svelte/dist/style.css";
import "./xyflow.css";

import {
  Background,
  BackgroundVariant,
  ControlButton,
  Controls,
  SvelteFlow,
} from "@xyflow/svelte";
// Icons
import DownloadSimpleIcon from "phosphor-svelte/lib/DownloadSimpleIcon";
import FunctionIcon from "phosphor-svelte/lib/FunctionIcon";
//import PlayIcon from "phosphor-svelte/lib/PlayIcon";
import UploadSimpleIcon from "phosphor-svelte/lib/UploadSimpleIcon";
import { type Component } from "svelte";

import DefaultEdge from "../edges/DefaultEdge.svelte";
import { useGraphService } from "../graph-services";
import DefaultNode from "../nodes/DefaultNode.svelte";
import InputNode from "../nodes/InputNode.svelte";
import type { UjEdgeProps, UjNodeProps } from "../types";
import useDebugActions from "./useDebugActions";
import useMenusAndPopups from "./useMenusAndPopups";

const nodeTypes: Record<string, Component<UjNodeProps>> = {
  in: InputNode,
  default: DefaultNode,
};

const edgeTypes: Record<string, Component<UjEdgeProps>> = {
  default: DefaultEdge,
};

const rawStoreService = useGraphService("rawStoreService");

const {
  onpaneclick,
  onpanecontextmenu,
  onnodecontextmenu,
  onedgecontextmenu,
  onselectioncontextmenu,
  onconnectend,
  onpopupgallery,
  onsavelocalstorage,
} = useMenusAndPopups();

const {
  isValidConnection,
  onbeforeconnect,
  onconnect,
  onconnectstart,
  // onconnectend,
  ondelete,
} = useDebugActions();
</script>

<SvelteFlow
  bind:nodes={rawStoreService.nodes}
  bind:edges={rawStoreService.edges}
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
    <ControlButton onclick={onsavelocalstorage}>
      <UploadSimpleIcon />
    </ControlButton>
    <ControlButton onclick={onsavelocalstorage}>
      <DownloadSimpleIcon />
    </ControlButton>
  </Controls>
</SvelteFlow>

<style>
</style>
