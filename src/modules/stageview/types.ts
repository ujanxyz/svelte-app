export interface PipelineSlot {
  name: string;
  type: string; // e.g. "int", "float3", "points2d"
}

export interface PipelineStage {
  id: string;
  label: string;
  inputs: PipelineSlot[];
  outputs: PipelineSlot[];
}

export interface PipelineEdge {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}

export interface PipelineVar {
  id: string;
  name: string;
  type: string;
  producerNode: string;
  producerHandle: string;
  consumers: {
    nodeId: string;
    handle: string;
  }[];
}
