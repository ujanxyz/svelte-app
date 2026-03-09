import type { Node, Edge } from "@xyflow/svelte";

export const initialNodes: Node[] = [
  {
    id: "fnA",
    data: { label: "Func A" },
    type: "default",
    position: { x: 0, y: 0 },
  },
  {
    id: "fnB",
    data: { label: "Func B" },
    type: "default",
    position: { x: 0, y: 200 },
  },
  {
    id: "fnC",
    data: { label: "Func C" },
    type: "default",
    position: { x: 200, y: 0 },
  },
  {
    id: "fnD",
    data: { label: "Func D" },
    type: "default",
    position: { x: 200, y: 200 },
  },

  // {
  //   id: "in1",
  //   data: { label: "Input 1" },
  //   type: "in",
  //   position: { x: 150, y: 0 },
  // },
];

export const initialEdges: Edge[] = [
  {
    id: "AD",
    source: "fnA",
    target: "fnD",
    sourceHandle: "mut0o",
    targetHandle: "in0",
    type: "custom",
    data: {
      label: "reconnectable edge",
    },
  },
  {
    id: "AC",
    source: "fnA",
    target: "fnC",
    sourceHandle: "out0",
    targetHandle: "mut0i",
    type: "custom",
    data: {
      label: "reconnectable edge",
    },
  },
  {
    id: "BC",
    source: "fnB",
    target: "fnC",
    sourceHandle: "mut0o",
    targetHandle: "in0",
    type: "custom",
    data: {
      label: "reconnectable edge",
    },
  },
];
