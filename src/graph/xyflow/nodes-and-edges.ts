import type { Edge, Node } from "@xyflow/svelte";

import type { xy } from "@/types/xy";

export const initialNodes: Node<xy.xyNodeData>[] = [
  {
    id: "a1234",
    data: {
      info: {
        rawId: 1,
        alnumid: "a1234",
        fnuri: "/dummy/in-pt",
        ins: [],
        outs: ["t"],
        inouts: [],
      },
      label: "Input Text",
      funcid: "/dummy/in-pt",
      ins: [],
      outs: [],
      inouts: [],
    },
    type: "default",
    position: { x: -200, y: 0 },
  },
  {
    id: "b1234",
    data: {
      info: {
        rawId: 2,
        alnumid: "b1234",
        fnuri: "/dummy/fn-b",
        ins: ["p1"],
        outs: ["fx"],
        inouts: [],
      },
      label: "Coord Function",
      funcid: "/dummy/fn-b",
      ins: [{ name: "x", type: "coord2d" }],
      outs: [{ name: "fx", type: "float" }],
      inouts: [],
    },
    type: "default",
    position: { x: 0, y: -100 },
  },
  {
    id: "c1234",
    data: {
      info: {
        rawId: 3,
        alnumid: "c1234",
        fnuri: "/dummy/trans-pt",
        ins: ["in1", "in2", "in3"],
        outs: [],
        inouts: ["x"],
      },
      label: "Transform Color",
      funcid: "/dummy/trans-pt",
      ins: [
        { name: "in1", type: "color" },
        { name: "in2", type: "text" },
        { name: "in3", type: "coord2d" },
      ],
      outs: [],
      inouts: [{ name: "x", type: "color" }],
    },
    type: "default",
    position: { x: 0, y: 100 },
  },
  {
    id: "d1234",
    data: {
      info: {
        rawId: 4,
        alnumid: "d1234",
        fnuri: "/sink/simple-res",
        ins: ["f"],
        outs: [],
        inouts: [],
      },
      label: "Result",
      funcid: "/sink/simple-res",
      ins: [{ name: "f", type: "float" }],
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
    source: "a1234",
    target: "b1234",
    sourceHandle: "t",
    targetHandle: "p1",
    type: "bezier",
    data: {
      label: "Dummy A to Point func",
    },
    animated: false,
  },
  {
    id: "a/x-p/x",
    source: "a1234",
    target: "c1234",
    sourceHandle: "t",
    targetHandle: "in2",
    type: "default",
    data: {
      label: "Dummy A to Transform",
    },
    animated: false,
  },
  {
    id: "b/fx-r",
    source: "b1234",
    target: "d1234",
    sourceHandle: "fx",
    targetHandle: "f",
    type: "default",
    data: {
      label: "reconnectable edge",
    },
    animated: false,
  },
  {
    id: "t/x-r/f",
    source: "c1234",
    target: "d1234",
    sourceHandle: "x",
    targetHandle: "f",
    type: "default",
    data: {
      label: "Transform to Result",
    },
    animated: false,
  },
];
