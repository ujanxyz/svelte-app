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
import PlayIcon from "phosphor-svelte/lib/PlayIcon";
import UploadSimpleIcon from "phosphor-svelte/lib/UploadSimpleIcon";
// </icons>
import { type Component } from "svelte";

import { useAppSettings } from "@/features/app-settings/useAppSettings.svelte";
import type { xy } from "@/types/xy";
import { getAppIcon } from "@/utils/appIcons";

import { useGraphService } from "../graph-services";
import DefaultEdge from "./DefaultEdge.svelte";
import FunctionNode from "./FunctionNode.svelte";
import GraphIONode from "./GraphIONode.svelte";
import useEditorInteractions from "./useEditorInteractions";
import useMenusAndPopups from "./useMenusAndPopups";
//import PlayIcon from "phosphor-svelte/lib/PlayIcon";

const nodeTypes: Record<string, Component<xy.xyNodeProps>> = {
  default: FunctionNode,
  function: FunctionNode,
  graphio: GraphIONode,
};

const edgeTypes: Record<string, Component<xy.xyEdgeProps>> = {
  default: DefaultEdge,
};

const { isDarkTheme } = useAppSettings();
const WrenchIcon = getAppIcon("wrench");

const rawStoreService = useGraphService("rawStoreService");

const {
  onpaneclick,
  onpanecontextmenu,
  onnodecontextmenu,
  onedgecontextmenu,
  onselectioncontextmenu,
  onconnectend,
  // Custom app-declared handlers.
  onMediaManager,
  onpopupgallery,
  ondatainspector,
  onsavelocalstorage,
  onbuildpipeline,
  onplaypipeline,
} = useMenusAndPopups();

const {
  isValidConnection,
  ondelete,
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
  fitView={false}
  colorMode={$isDarkTheme ? "dark" : "light"}
  // Debug actions:
  {isValidConnection}
  {ondelete}
  {onbeforeconnect}
  {onconnect}
  {onconnectstart}
  {onconnectend}
  {onpaneclick}
  multiSelectionKey={null}
>
  <Background
    variant={BackgroundVariant.Dots}
    gap={4}
    patternClass={"dots"}
    size={1.2}
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
    <ControlButton onclick={onMediaManager}>
      <EyeIcon />
    </ControlButton>
    <ControlButton onclick={onbuildpipeline}>
      <WrenchIcon />
    </ControlButton>
    <ControlButton onclick={onplaypipeline}>
      <PlayIcon />
    </ControlButton>
  </Controls>
</SvelteFlow>
