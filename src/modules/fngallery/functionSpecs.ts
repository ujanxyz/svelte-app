import type { fn } from "@/types/function";

//------------------------------------------------------------------------------
//  Primitive Generation
//------------------------------------------------------------------------------

const genFns: fn.FunctionInfo[] = [
  {
    uri: "/gen/grid",
    label: "Grid 2D",
    desc: "Generates a uniform grid of points",
    params: [
      { name: "bounds", dtype: "float4", access: "I" },
      { name: "cols", dtype: "int", access: "I" },
      { name: "rows", dtype: "int", access: "I" },
      { name: "points", dtype: "float2[]", access: "O" },
    ],
  },
  {
    uri: "/gen/line",
    label: "Line / Path",
    desc: "Generates a sequence of points along a vector",
    params: [
      { name: "start", dtype: "float2", access: "I" },
      { name: "end", dtype: "float2", access: "I" },
      { name: "steps", dtype: "int", access: "I" },
      { name: "points", dtype: "float2[]", access: "O" },
    ],
  },
  {
    uri: "/gen/circle",
    label: "Circle Points",
    desc: "Generates points along the circumference of a circle",
    params: [
      { name: "center", dtype: "float2", access: "I" },
      { name: "radius", dtype: "float", access: "I" },
      { name: "count", dtype: "int", access: "I" },
      { name: "points", dtype: "float2[]", access: "O" },
    ],
  },
  {
    uri: "/gen/random-disk",
    label: "Random in Circle",
    desc: "Poisson-disk or uniform distribution within a radius",
    params: [
      { name: "center", dtype: "float2", access: "I" },
      { name: "radius", dtype: "float", access: "I" },
      { name: "seed", dtype: "int", access: "I" },
      { name: "count", dtype: "int", access: "I" },
      { name: "points", dtype: "float2[]", access: "O" },
    ],
  },
  {
    uri: "/gen/range",
    label: "Float Range",
    desc: "Generates a sequence of numbers (arithmetic progression)",
    params: [
      { name: "start", dtype: "float", access: "I" },
      { name: "stop", dtype: "float", access: "I" },
      { name: "step", dtype: "float", access: "I" },
      { name: "out", dtype: "float[]", access: "O" },
    ],
  },
];

//------------------------------------------------------------------------------
// Noise Functions
//------------------------------------------------------------------------------

const noiseFns: fn.FunctionInfo[] = [
  {
    uri: "/noise/perlin-2d",
    label: "Perlin Noise",
    desc: "Returns 2D Perlin values (-1 to 1)",
    params: [
      { name: "uv", dtype: "float2[]", access: "I" },
      { name: "scale", dtype: "float", access: "I" },
      { name: "seed", dtype: "float", access: "I" },
      { name: "val", dtype: "float[]", access: "O" },
    ],
  },
  {
    uri: "/noise/simplex-3d",
    label: "Simplex 3D",
    desc: "Higher quality noise often used for time-based animation (XY + Time)",
    params: [
      { name: "uv", dtype: "float2[]", access: "I" },
      { name: "z", dtype: "float", access: "I" },
      { name: "val", dtype: "float[]", access: "O" },
    ],
  },
  {
    uri: "/noise/fbm",
    label: "Fractal Brownian Motion",
    desc: "Layered noise for cloud-like or mountainous textures",
    params: [
      { name: "uv", dtype: "float2[]", access: "I" },
      { name: "octaves", dtype: "int", access: "I" },
      { name: "persistence", dtype: "float", access: "I" },
      { name: "val", dtype: "float[]", access: "O" },
    ],
  },
  {
    uri: "/noise/curl-2d",
    label: "Curl Noise",
    desc: "Calculates the curl of a noise field, perfect for flow fields",
    params: [
      { name: "uv", dtype: "float2[]", access: "I" },
      { name: "step", dtype: "float", access: "I" },
      { name: "vectors", dtype: "float2[]", access: "O" },
    ],
  },
  {
    uri: "/noise/cellular",
    label: "Cellular (Worley) Noise",
    desc: "Returns distance to nearest points for crystalline patterns",
    params: [
      { name: "uv", dtype: "float2[]", access: "I" },
      { name: "val", dtype: "float[]", access: "O" },
    ],
  },
];

//------------------------------------------------------------------------------
// Sampling Functions
//------------------------------------------------------------------------------

const samplingFns: fn.FunctionInfo[] = [
  {
    uri: "/sampling/remap",
    label: "Remap Range",
    desc: "Maps a value from [sourceMin, sourceMax] to [targetMin, targetMax]",
    params: [
      { name: "val", dtype: "float[]", access: "M" },
      { name: "sMin", dtype: "float", access: "I" },
      { name: "sMax", dtype: "float", access: "I" },
      { name: "tMin", dtype: "float", access: "I" },
      { name: "tMax", dtype: "float", access: "I" },
    ],
  },
  {
    uri: "/sampling/color-ramp",
    label: "Color Ramp",
    desc: "Maps a 0.0-1.0 float to a multi-stop color gradient",
    params: [
      { name: "t", dtype: "float[]", access: "I" },
      { name: "colors", dtype: "float3[]", access: "I" },
      { name: "stops", dtype: "float[]", access: "I" },
      { name: "out", dtype: "float3[]", access: "O" },
    ],
  },
  {
    uri: "/sampling/threshold",
    label: "Step / Threshold",
    desc: "Returns 0 or 1 based on a threshold value",
    params: [
      { name: "val", dtype: "float[]", access: "M" },
      { name: "edge", dtype: "float", access: "I" },
    ],
  },
  {
    uri: "/sampling/nearest-neighbor",
    label: "Nearest Point",
    desc: "Finds the closest point in a cloud to target points",
    params: [
      { name: "targets", dtype: "float2[]", access: "I" },
      { name: "cloud", dtype: "float2[]", access: "I" },
      { name: "indices", dtype: "int[]", access: "O" },
    ],
  },
];

//------------------------------------------------------------------------------
// Vec2 Functions
//------------------------------------------------------------------------------

const vecFns: fn.FunctionInfo[] = [
  {
    uri: "/vec2/add-force",
    label: "Add Force",
    desc: "Offsets points by a list of vectors (e.g., adding noise to position)",
    params: [
      { name: "points", dtype: "float2[]", access: "M" },
      { name: "vectors", dtype: "float2[]", access: "I" },
      { name: "strength", dtype: "float", access: "I" },
    ],
  },
  {
    uri: "/vec2/rotate",
    label: "Rotate Around Pivot",
    desc: "Rotates points around a specific center coordinate",
    params: [
      { name: "points", dtype: "float2[]", access: "M" },
      { name: "center", dtype: "float2", access: "I" },
      { name: "angle", dtype: "float", access: "I" },
    ],
  },
  {
    uri: "/vec2/look-at",
    label: "Look At Vector",
    desc: "Calculates angles between points and a target (for orienting shapes)",
    params: [
      { name: "points", dtype: "float2[]", access: "I" },
      { name: "target", dtype: "float2", access: "I" },
      { name: "angles", dtype: "float[]", access: "O" },
    ],
  },
  {
    uri: "/vec2/normalize",
    label: "Normalize Vectors",
    desc: "Sets vector length to 1.0",
    params: [{ name: "vecs", dtype: "float2[]", access: "M" }],
  },
];

//------------------------------------------------------------------------------
// Color Functions
//------------------------------------------------------------------------------

const colorFns: fn.FunctionInfo[] = [
  {
    uri: "/color/hsv-to-rgb",
    label: "HSV to RGB",
    desc: "Convert Hue, Saturation, and Value to RGB float3",
    params: [
      { name: "h", dtype: "float[]", access: "I" }, // 0 to 360 or 0 to 1
      { name: "s", dtype: "float", access: "I" },
      { name: "v", dtype: "float[]", access: "I" },
      { name: "rgb", dtype: "float3[]", access: "O" },
    ],
  },
  {
    uri: "/color/complementary",
    label: "Complementary Palette",
    desc: "Generate the opposite color on the wheel for each input",
    params: [
      { name: "base", dtype: "float3[]", access: "I" },
      { name: "out", dtype: "float3[]", access: "O" },
    ],
  },
  {
    uri: "/color/analyze-brightness",
    label: "Luminance",
    desc: "Calculate the perceived brightness of colors (grayscale)",
    params: [
      { name: "rgb", dtype: "float3[]", access: "I" },
      { name: "lum", dtype: "float[]", access: "O" },
    ],
  },
  {
    uri: "/color/blend",
    label: "Blend Colors",
    desc: "Mix two color lists based on factor T (Mix/Overlay/Multiply)",
    params: [
      { name: "a", dtype: "float3[]", access: "I" },
      { name: "b", dtype: "float3[]", access: "I" },
      { name: "t", dtype: "float[]", access: "I" },
      { name: "mode", dtype: "string", access: "I" }, // "mix", "multiply", "add"
      { name: "out", dtype: "float3[]", access: "O" },
    ],
  },
  {
    uri: "/color/palette-analogous",
    label: "Analogous Palette",
    desc: "Generate colors adjacent to the base color on the wheel",
    params: [
      { name: "base", dtype: "float3", access: "I" },
      { name: "spread", dtype: "float", access: "I" },
      { name: "count", dtype: "int", access: "I" },
      { name: "palette", dtype: "float3[]", access: "O" },
    ],
  },
  {
    uri: "/color/lerp-sequence",
    label: "Gradient Ramp",
    desc: "Generate a smooth sequence of colors from a list of stops",
    params: [
      { name: "stops", dtype: "float3[]", access: "I" },
      { name: "steps", dtype: "int", access: "I" },
      { name: "sequence", dtype: "float3[]", access: "O" },
    ],
  },
  {
    uri: "/color/quantize",
    label: "Posterize / Quantize",
    desc: "Reduce colors to the nearest match from a provided palette",
    params: [
      { name: "input", dtype: "float3[]", access: "I" },
      { name: "palette", dtype: "float3[]", access: "O" },
    ],
  },
  {
    uri: "/color/contrast-ratio",
    label: "Contrast Check",
    desc: "Calculate WCAG contrast ratio between two color lists",
    params: [
      { name: "fg", dtype: "float3[]", access: "I" },
      { name: "bg", dtype: "float3[]", access: "I" },
      { name: "ratio", dtype: "float[]", access: "I" },
      { name: "fg", dtype: "float3[]", access: "I" },
      { name: "bg", dtype: "float3[]", access: "I" },
      { name: "ratio", dtype: "float[]", access: "O" },
    ],
  },
];


//------------------------------------------------------------------------------
// Gen-Art Functions
//------------------------------------------------------------------------------

const artFns: fn.FunctionInfo[] = [
  {
    uri: "/art/stipple-fill",
    label: "Stipple Points",
    desc: "Generate points within a mask based on a density map",
    params: [
      { name: "mask", dtype: "float[]", access: "I" },
      { name: "bounds", dtype: "float4", access: "I" },
      { name: "count", dtype: "int", access: "I" },
      { name: "points", dtype: "float2[]", access: "O" },
    ],
  },
  {
    uri: "/art/voronoi-mesh",
    label: "Voronoi Diagram",
    desc: "Generates cell polygons from seed points",
    params: [
      { name: "seeds", dtype: "float2[]", access: "I" },
      { name: "bounds", dtype: "float4", access: "I" },
      { name: "cells", dtype: "[][]float2", access: "O" }, // Array of polygons
    ],
  },
  {
    uri: "/art/recursive-subdiv",
    label: "Rect Subdivide",
    desc: "Splits a rectangle into smaller ones (Mondrian style)",
    params: [
      { name: "rect", dtype: "float4", access: "I" },
      { name: "iterations", dtype: "int", access: "I" },
      { name: "minSize", dtype: "float", access: "I" },
      { name: "rects", dtype: "float4[]", access: "O" },
    ],
  },
  {
    uri: "/art/chaikin-smooth",
    label: "Chaikin Smoothing",
    desc: "Smoothes a rough polyline by corner cutting",
    params: [
      { name: "iterations", dtype: "int", access: "I" },
      { name: "polyline", dtype: "float2[]", access: "M" },
    ],
  },
  {
    uri: "/art/l-system",
    label: "L-System Generator",
    desc: "Generates a string-based fractal path",
    params: [
      { name: "axiom", dtype: "string", access: "I" },
      { name: "rules", dtype: "string", access: "I" },
      { name: "depth", dtype: "int", access: "I" },
      { name: "path", dtype: "float2[]", access: "I" },
      { name: "seeds", dtype: "float2[]", access: "I" },
      { name: "bounds", dtype: "float4", access: "I" },
      { name: "cells", dtype: "float2[][]", access: "O" },
    ],
  },
];

//------------------------------------------------------------------------------
// Array Functions
//------------------------------------------------------------------------------

const arrayFns: fn.FunctionInfo[] = [
  {
    uri: "/array/shuffle",
    label: "Shuffle Array",
    desc: "Randomly reorder a list of elements using a seed",
    params: [
      { name: "data", dtype: "float[]", access: "M" },
      { name: "seed", dtype: "int", access: "I" },
    ],
  },
  {
    uri: "/array/slice",
    label: "Slice List",
    desc: "Extract a subset of a list",
    params: [
      { name: "data", dtype: "float[]", access: "M" },
      { name: "seed", dtype: "int", access: "I" },
    ],
  }
];

//------------------------------------------------------------------------------
// Export Functions
//------------------------------------------------------------------------------

const exportFns: fn.FunctionInfo[] = [
  {
    uri: "/export/svg-path",
    label: "Export SVG Path",
    desc: "Converts a point array into an SVG <path> d-attribute",
    params: [
      { name: "points", dtype: "float2[]", access: "I" },
      { name: "closed", dtype: "bool", access: "I" },
      { name: "svgString", dtype: "string", access: "O" },
    ],
  },
  {
    uri: "/export/canvas-draw",
    label: "Draw on Canvas",
    desc: "Draws circles/rects to an HTML5 Canvas context",
    params: [
      { name: "points", dtype: "float2[]", access: "I" },
      { name: "radii", dtype: "float[]", access: "I" },
      { name: "colors", dtype: "float3[]", access: "I" },
      { name: "ctx", dtype: "canvas_context", access: "M" },
    ],
  },
  {
    uri: "/export/poly-to-svg",
    label: "Polygon to SVG",
    desc: "Converts a nested list of polygons to SVG <polygon> tags",
    params: [
      { name: "polys", dtype: "float2[][]", access: "I" },
      { name: "fill", dtype: "float3[]", access: "I" },
      { name: "svgElements", dtype: "string[]", access: "O" },
    ],
  },
];

function getFunctionSpecs(): fn.FunctionInfo[] {
  return [
    ...genFns,
    ...noiseFns,
    ...samplingFns,
    ...vecFns,
    ...colorFns,
    ...artFns,
    ...arrayFns,
    ...exportFns,
  ];
}

export default getFunctionSpecs;
