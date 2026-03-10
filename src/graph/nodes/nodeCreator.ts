import type { Node, XYPosition } from "@xyflow/svelte";
import { createIdGenerator } from "../../utils/idGenerator";
import type { FuncParam, FuncSpec } from "../../modules/fngallery/types";
import type { NodeDetailsData } from "./types";

function _makeParams(params: FuncParam[]) {
  const ins: NodeDetailsData["ins"] = [];
  const outs: NodeDetailsData["outs"] = [];
  const inouts: NodeDetailsData["inouts"] = [];
  for (const p of params) {
    const { name, type } = p;
    switch (p.access) {
      case "i":
        ins.push({ name, type });
        break;
      case "o":
        outs.push({ name, type });
        break;
      case "m":
        inouts.push({ name, type });
        break;
    }
  }
  return { ins, outs, inouts };
}

interface NodeCreator {
  newNodFromFunc(fnSpec: FuncSpec, position: XYPosition): Node;
}

export function makeNodeCreator(): NodeCreator {
  const nodeIdGen = createIdGenerator(12);

  function newNodFromFunc(fnSpec: FuncSpec, position: XYPosition): Node {
    const nodeId: string = nodeIdGen();
    console.log(nodeId);
    const { ins, outs, inouts } = _makeParams(fnSpec.params);
    const details: NodeDetailsData = {
      label: fnSpec.label,
      funcid: fnSpec.id,
      _funspec: fnSpec,
      ins,
      outs,
      inouts,
    };
    return {
      id: nodeId,
      data: details,
      type: "default",
      position,
    } as Node;
  }

  return { newNodFromFunc };
}
