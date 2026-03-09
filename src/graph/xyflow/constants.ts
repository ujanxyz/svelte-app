export const CONTXT_KEY_XY_ACTIONS = "xy-actions";

export const OverlayTriggers = {
  PANE_CTX_MENU: "p",
  NODE_CTX_MENU: "n",
  EDGE_CTX_MENU: "e",
  SELECTION_CTX_MENU: "s",
  GALLERY_POPUP: "g",
};

export const MenuCodes = {
  // Pane context menu.
  NEW_NODE: "n+",
  NEW_INPUT: "i+",
  NEW_OUTPUT: "o+",
  RM_NODES: "n<",
  RM_EDGES: "e<",
  PIPELINE_INFO: "p?",

  // Node context menu.
  RM_NODE: "n-",
  NODE_INFO: "n?",
  NODE_EXEC: "n!",

  // Edge context menu.
  RM_EDGE: "e-",

  // Selection context menu.
  RM_SELECTION: "s-",
  SELECTION_EXEC: "s!",
};
