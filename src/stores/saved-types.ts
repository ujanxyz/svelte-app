// An external input to the graph. This could be manually entered data (like list of numbers,
// colors, coordinate lists etc). Or it could be uploaded files, like PNG, MP4 video, CSV,
// or ZIP file. There will be various unwrap functions available which can be used in the
// backend of this node and export the data available as an output slot.
interface UjGraphInputSpec {
  kind: "in";
  id: string;
  uri: string; // Identifies the registered unwrap function, like "/in/csv-to-points", "/in/mp4-to-bitmap-per-frame"
  name: string; // Defaults like "Input 1".
  accepts: string[]; // mp4, jpeg, csv etc
  dtype: string; // drawable, bitmap, geometric data

  // Slot id format: "<id>$out"
}

// An external input from the graph. This takes a piece of computed data and exports as
// asset like PNG, MP4 video, CSV, or ZIP file.
interface UjGraphOutputSpec {
  kind: "out";
  id: string;
  uri: string; // Identifies the registered unwrap function. like "/out/canvas-to-png"
  name: string; // Defaults like "Output 1".
  dtype: string; // drawable, bitmap, geometric data
  emits: string;

  // Slot id format: "<id>$in"
}

// A function graph node is a pure function (side-effect free) with 0 or more input params,
// and 1 or more output params.
interface UjFunctionNodeSpec {
  kind: "fn";
  id: string;
  uri: string; // Identifies the registered transform function. like "/fn/points-on-curve"
  name: string;
  ins: { name: string; dtype: string }[]; // The input params
  outs: { name: string; dtype: string }[]; // The output params, must have at least one

  // Slot (input) id format: "<id>$in:<param-name>"
  // Slot (output) id format: "<id>$out:<param-name>"
}

// An operator graph node is a mutator stage (has side-effect) that operates on a single piece of
// data. Typically these are draw modules on canvas, modifiers on geometry mesh.
// The only in-out param is implicit. Additionally there are 0 or more named input params.
interface UjOperatorNodeSpec {
  kind: "op";
  id: string;
  uri: string;
  name: string;
  dtype: string;
  ins: { name: string; dtype: string }[];

  // Slot id (inputs) format: "<id>$in:<param-name>"
  // Slot id (implicit operable) format: "<id>$in", "<id>$out"
}

// An operator graph node returns a wrapped function, which can be invoked by later stages
// like a lambda object. They can be stateful or stateless, finite or infinite.
// The output from this node is a functor or lambda object which can be used as an iterator
// (stateful), generator (can be infinite), or field function (takes coordinate as input).
// The only out param is implicit, which is a functor type. We specify the args types and the
// return type of the functor object. Like std::function<R(A1, A2, ...)> in C++.
// Additionally there are 0 or more named input params.
interface UjLambdaNodeSpec {
  kind: "lam";
  id: string;
  uri: string;
  name: string;
  mode: "generator" | "iterator" | "field";
  returns: string; // Returned data type.
  argtypes: string[];
  ins: { name: string; datatype: string }[];

  // Slot id (inputs) format: "<id>$in:<param-name>"
  // Slot id (fn output) format: "<id>$out"
}

type UjSavedNodeSpec =
  | UjGraphInputSpec
  | UjGraphOutputSpec
  | UjFunctionNodeSpec
  | UjOperatorNodeSpec
  | UjLambdaNodeSpec;

/**
 * Describes an edge connection between two stages.
 */
interface UjSavedEdge {
  id: string;
  sourceId: string;
  targetId: string;
  sourceSlot: string;
  targetSlot: string;
}

interface UjSavedSlotData {
  id: string; // The slot id.
  dtype: string; // The data type
  payload: any;
}

interface UjSavedGraphMeta {
  name: string;
  created: number;
  modified: number;
}

interface UjSavedPipeline {
  meta: UjSavedGraphMeta;
  nodes: UjSavedNodeSpec[];
  edges: UjSavedEdge[];
  overrides: UjSavedSlotData[];
}

/**
 * Do not export the types directly, rather via keyed lookups.
 */

type _PublicTypesMap = {
  node: UjSavedNodeSpec;
  edge: UjSavedEdge;
  nodekind: UjSavedNodeSpec["kind"];

  // Individual step types.
  input: UjGraphInputSpec;
  output: UjGraphOutputSpec;
  function: UjFunctionNodeSpec;
  operator: UjOperatorNodeSpec;
  lambda: UjLambdaNodeSpec;

  // Pipeline info.
  slotdata: UjSavedSlotData;
  meta: UjSavedGraphMeta;
  pipeline: UjSavedPipeline;
};

export type UjSavedTypes<K extends keyof _PublicTypesMap> =
  K extends keyof _PublicTypesMap ? _PublicTypesMap[K] : never;
