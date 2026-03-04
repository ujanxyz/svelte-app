const OverlayTriggers = {
    PANE_CTX_MENU: "p",
    NODE_CTX_MENU: "n",
    EDGE_CTX_MENU: "e",
    SELECTION_CTX_MENU: "s",
    GALLERY_POPUP: "g",
};

const MenuCodes = {
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

    // Edge context menu.
    RM_EDGE: "e-",

    // Selection context menu.
    RM_SELECTION: "s-",
};

export {OverlayTriggers, MenuCodes};
