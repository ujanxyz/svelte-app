import type * as ctxmenu from "@/modules/ctxmenu";

import { MenuCodes } from "../constants";

// export const paneMenuData: MenuItem[] = [
//   { code: MenuCodes.NEW_NODE, label: "New Node ..." },
//   { code: MenuCodes.NEW_INPUT, label: "New Input ..." },
//   { code: MenuCodes.NEW_OUTPUT, label: "New Output ..." },
//   "-",
//   { code: MenuCodes.PIPELINE_INFO, label: "Pipeline Info" },
//   "-",
//   { code: MenuCodes.RM_NODES, label: "Clear Graph", shortcut: "Ctrl+G" },
//   { code: MenuCodes.RM_EDGES, label: "Clear Edges", shortcut: "Ctrl+E" },
// ];

// export const nodeMenuData: MenuItem[] = [
//   { code: MenuCodes.NODE_INFO, label: "Node Info" },
//   { code: MenuCodes.NODE_EXEC, label: "Run Node Function" },
//   "-",
//   { code: MenuCodes.RM_NODE, label: "Delete Node" },
// ];

// export const edgeMenuData: MenuItem[] = [
//   { code: MenuCodes.RM_EDGE, label: "Delete Edge" },
// ];

// export const selectionMenuData: MenuItem[] = [
//   { code: MenuCodes.SELECTION_EXEC, label: "Run Selected Nodes" },
//   "-",
//   { code: MenuCodes.RM_SELECTION, label: "Delete Selected" },
// ];

// export const connEndMenuData: MenuItem[] = [
//   { code: MenuCodes.NEW_INPUT, label: "New Input ..." },
//   { code: MenuCodes.NEW_NODE, label: "New Node ..." },
// ];





export const paneMenuItems: readonly ctxmenu.CtxMenuItem<string>[] = [
  {
    label: "New Node",
    code: MenuCodes.NEW_NODE,
    icon: "plus",
  },
  {
    label: "New Input",
    code: MenuCodes.NEW_INPUT,
    icon: "plus",
  },
  {
    label: "New Output",
    code: MenuCodes.NEW_OUTPUT,
    icon: "plus",
  },
  {
    label: "",
    separator: true,
  },
  {
    label: "Pipeline Info",
    code: MenuCodes.PIPELINE_INFO,
    icon: "info",
  },
  {
    label: "",
    separator: true,
  },
  {
    label: "Clear Graph",
    code: MenuCodes.RM_NODES,
    icon: "trash",
    shortcut: "Ctrl+G",
  },
  {
    label: "Clear Edges",
    code: MenuCodes.RM_EDGES,
    icon: "trash",
    shortcut: "Ctrl+E",
  },
];

export const nodeMenuItems: readonly ctxmenu.CtxMenuItem<string>[] = [
  {
    label: "Node Info",
    code: MenuCodes.NODE_INFO,
    icon: "info",
  },
  {
    label: "Run Node Function",
    code: MenuCodes.NODE_EXEC,
    icon: "arrow-clockwise",
  },
  {
    label: "",
    separator: true,
  },
  {
    label: "Delete Node",
    code: MenuCodes.RM_NODE,
    icon: "trash",
  },
];

export const edgeMenuItems: readonly ctxmenu.CtxMenuItem<string>[] = [
  {
    label: "Delete Edge",
    code: MenuCodes.RM_EDGE,
    icon: "trash",
  },
];

export const selectionMenuItems: readonly ctxmenu.CtxMenuItem<string>[] = [
  {
    label: "Run Selected Nodes",
    code: MenuCodes.SELECTION_EXEC,
    icon: "arrow-clockwise",
  },
  {
    label: "",
    separator: true,
  },
  {
    label: "Delete Selected",
    code: MenuCodes.RM_SELECTION,
    icon: "trash",
  },
];

export const connEndMenuItems: readonly ctxmenu.CtxMenuItem<string>[] = [
  {
    label: "New Input ...",
    code: MenuCodes.NEW_INPUT,
    icon: "plus",
  },
  {
    label: "New Node ...",
    code: MenuCodes.NEW_NODE,
    icon: "plus",
  },
];
