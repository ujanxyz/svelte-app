import type { Node, Edge } from "@xyflow/svelte";

export const initialNodes: Node[] = [
  {
    id: "lwnfPJ0",
    data: {
      label: "Input Point",
      funcid: "/dummy/in-pt",
      ins: [],
      outs: [
        {name: "x", type: "float2"},
      ],
      inouts: [],
    },
    type: "default",
    position: { x: -200, y: 0 },
  },
  {
    id: "gMn6deH",
    data: {
      label: "Point Function",
      funcid: "/dummy/fn-b",
      ins: [
        {name: "x", type: "float2"},
      ],
      outs: [
        {name: "fx", type: "float"},
      ],
      inouts: [],
    },
    type: "default",
    position: { x: 0, y: -100 },
  },
  {
    id: "an52dSd9",
    data: {
      label: "Transform Point",
      funcid: "/dummy/trans-pt",
      ins: [],
      outs: [],
      inouts: [
        {name: "x", type: "float2"},
      ],
    },
    type: "default",
    position: { x: 0, y: 100 },
  },
  {
    id: "kL34e1dex",
    data: {
      label: "Result",
      funcid: "/sink/simple-res",
      ins: [
        {name: "f", type: "float"},
      ],
      outs: [],
      inouts: [],
    },
    type: "default",
    position: { x: 200, y: 0 },
  },
];

export const initialEdges: Edge[] = [
  {
    id: "a/x-b/x",
    source: "lwnfPJ0",
    target: "gMn6deH",
    sourceHandle: "x",
    targetHandle: "x",
    type: "bezier",
    data: {
      label: "Dummy A to Point func",
    },
    animated: true,
  },
  {
    id: "a/x-p/x",
    source: "lwnfPJ0",
    target: "an52dSd9",
    sourceHandle: "x",
    targetHandle: "x/in",
    type: "bezier",
    data: {
      label: "Dummy A to Transform",
    },
    animated: true,
  },
  {
    id: "b/fx-r",
    source: "gMn6deH",
    target: "kL34e1dex",
    sourceHandle: "fx",
    targetHandle: "f",
    type: "bezier",
    data: {
      label: "reconnectable edge",
    },
    animated: true,
  },
  {
    id: "t/x-r/f",
    source: "an52dSd9",
    target: "kL34e1dex",
    sourceHandle: "x/out",
    targetHandle: "f",
    type: "bezier",
    data: {
      label: "Transform to Result",
    },
    animated: true,
  },
];
