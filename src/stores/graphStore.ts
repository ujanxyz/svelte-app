import { writable } from "svelte/store";
import type { IGraph } from "../types/Graph";

function createGraphStore() {
  const { subscribe, update, set } = writable<IGraph>(_makeDefaultGraph());
  let nextNodeId = 0;

  function addNode(funcName: string, inSlots: string[], outSlots: string[]) {
    const newNodeId = `node-${nextNodeId++}`;
    const newNode = {
      id: newNodeId,
      label: funcName,
      ins: inSlots,
      outs: outSlots
    };
    update(graph => {
      return {
        ...graph,
        nodes: [...graph.nodes, newNode],
      };
    });
  }

  function addEdge(srcNode: string, srcSlot: string, dstNode: string, dstSlot: string) {
    const newEdgeId = `edge-${Date.now()}`;
    const newEdge = {
      id: newEdgeId,
      src: srcNode,
      srcSlot,
      dst: dstNode,
      dstSlot
    };
    update(graph => {
      return {
        ...graph,
        edges: [...graph.edges, newEdge],
      };
    });
  }

  function clearGraph() {
    set(_makeDefaultGraph());
  }

  return {
    subscribe,
    addNode,
    addEdge,
    clearGraph,
  }
}

function _makeDefaultGraph(): IGraph {
  return {
    id: "default",
    label: "Default Graph",
    nodes: [],
    edges: []
  };
}

export const graphStore = createGraphStore();
