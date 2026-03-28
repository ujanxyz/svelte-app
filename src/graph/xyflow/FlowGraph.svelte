<script lang="ts">
import "@xyflow/svelte/dist/style.css";
import "./xyflow.css";

import {
  Background,
  BackgroundVariant,
  ControlButton,
  Controls,
  Panel,
  SvelteFlow,
} from "@xyflow/svelte";
// <icons>
import DownloadSimpleIcon from "phosphor-svelte/lib/DownloadSimpleIcon";
import EyeIcon from "phosphor-svelte/lib/EyeIcon";
import FunctionIcon from "phosphor-svelte/lib/FunctionIcon";
import UploadSimpleIcon from "phosphor-svelte/lib/UploadSimpleIcon";
// </icons>
import { type Component } from "svelte";

import DefaultEdge from "../edges/DefaultEdge.svelte";
import { useGraphService } from "../graph-services";
import DefaultNode from "../nodes/DefaultNode.svelte";
import InputNode from "../nodes/InputNode.svelte";
import type { UjEdgeProps, UjNodeProps } from "../types";
import useEditorInteractions from "./useEditorInteractions";
import useMenusAndPopups from "./useMenusAndPopups";
//import PlayIcon from "phosphor-svelte/lib/PlayIcon";

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
  onsavelocalstorage,
  onpopupgallery,
  ondatainspector,
} = useMenusAndPopups();

const {
  isValidConnection,
  onbeforeconnect,
  onconnect,
  onconnectstart,
  onedgeclick,
  // onconnectend,
} = useEditorInteractions();
</script>

<SvelteFlow
  bind:nodes={rawStoreService.nodes}
  bind:edges={rawStoreService.edges}
  bind:viewport={rawStoreService.viewport}
  {nodeTypes}
  {edgeTypes}
  {onpanecontextmenu}
  {onnodecontextmenu}
  {onedgeclick}
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
    <ControlButton onclick={onsavelocalstorage}>
      <UploadSimpleIcon />
    </ControlButton>
    <ControlButton onclick={onsavelocalstorage}>
      <DownloadSimpleIcon />
    </ControlButton>
    <ControlButton onclick={onpopupgallery}>
      <FunctionIcon />
    </ControlButton>
    <ControlButton onclick={ondatainspector}>
      <EyeIcon />
    </ControlButton>
  </Controls>
</SvelteFlow>
