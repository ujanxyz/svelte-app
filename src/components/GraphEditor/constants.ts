const OverlayTriggers = {
    PANE_CTX_MENU: "p",
    NODE_CTX_MENU: "n",
    EDGE_CTX_MENU: "e",
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
    RM_EDGE: "e-",
    NODE_INFO: "n?",
};

export {OverlayTriggers, MenuCodes};
