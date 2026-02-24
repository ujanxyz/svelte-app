interface FuncParam {
  name: string;
  // Param type: input / output / mutate
  // Input params are read-only, output params are created from scratch.
  // Mutable params are both read and modified.
  access: "i" | "o" | "m";
  // The data type. Left as free string for implementation. "[]T" denotes array of type T.
  // Common values are:
  // int, int[], float, []float.
  // The qualifier "T"
  // Geometric types like: 2D coordinates (pair of x,y), intervals are represented as "float2" (2 floats).
  // Rectangles are represented as "float4".
  // Colors are represented as "float3" (for RGB).
  type: string;
};

interface FuncSpec {
  id: string;
  label: string;
  desc: string;
  params: FuncParam[];
};

export {FuncParam, FuncSpec};