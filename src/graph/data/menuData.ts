import type * as ctxmenu from "@/modules/ctxmenu";

import { MenuCodes } from "../constants";

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
