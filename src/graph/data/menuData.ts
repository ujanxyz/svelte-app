import type { MenuItem } from "../../overlay/context-menu/menu";
import { MenuCodes } from "../constants";

export const paneMenuData: MenuItem[] = [
  { code: MenuCodes.NEW_NODE, label: "New Node ..." },
  { code: MenuCodes.NEW_INPUT, label: "New Input ..." },
  { code: MenuCodes.NEW_OUTPUT, label: "New Output ..." },
  "-",
  { code: MenuCodes.PIPELINE_INFO, label: "Pipeline Info" },
  "-",
  { code: MenuCodes.RM_NODES, label: "Clear Graph", shortcut: "Ctrl+G" },
  { code: MenuCodes.RM_EDGES, label: "Clear Edges", shortcut: "Ctrl+E" },
];

export const nodeMenuData: MenuItem[] = [
  { code: MenuCodes.NODE_INFO, label: "Node Info" },
  { code: MenuCodes.NODE_EXEC, label: "Run Node Function" },
  "-",
  { code: MenuCodes.RM_NODE, label: "Delete Node" },
];

export const edgeMenuData: MenuItem[] = [
  { code: MenuCodes.RM_EDGE, label: "Delete Edge" },
];

export const selectionMenuData: MenuItem[] = [
  { code: MenuCodes.SELECTION_EXEC, label: "Run Selected Nodes" },
  "-",
  { code: MenuCodes.RM_SELECTION, label: "Delete Selected" },
];

export const connEndMenuData: MenuItem[] = [
  { code: MenuCodes.NEW_INPUT, label: "New Input ..." },
  { code: MenuCodes.NEW_NODE, label: "New Node ..." },
];
