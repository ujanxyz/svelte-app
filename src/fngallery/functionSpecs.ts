import type { FuncSpec } from "./types";

//------------------------------------------------------------------------------
//  Primitive Generation
//------------------------------------------------------------------------------

const genFns: FuncSpec[] = [
  {
    id: "/gen/grid",
    label: "Grid 2D",
    desc: "Generates a uniform grid of points",
    params: [
      { name: "bounds", access: "i", type: "float4" },
      { name: "cols", access: "i", type: "int" },
      { name: "rows", access: "i", type: "int" },
      { name: "points", access: "o", type: "[]float2" },
    ],
  },
  {
    id: "/gen/line",
    label: "Line / Path",
    desc: "Generates a sequence of points along a vector",
    params: [
      { name: "start", access: "i", type: "float2" },
      { name: "end", access: "i", type: "float2" },
      { name: "steps", access: "i", type: "int" },
      { name: "points", access: "o", type: "[]float2" },
    ],
  },
  {
    id: "/gen/circle",
    label: "Circle Points",
    desc: "Generates points along the circumference of a circle",
    params: [
      { name: "center", access: "i", type: "float2" },
      { name: "radius", access: "i", type: "float" },
      { name: "count", access: "i", type: "int" },
      { name: "points", access: "o", type: "[]float2" },
    ],
  },
  {
    id: "/gen/random-disk",
    label: "Random in Circle",
    desc: "Poisson-disk or uniform distribution within a radius",
    params: [
      { name: "center", access: "i", type: "float2" },
      { name: "radius", access: "i", type: "float" },
      { name: "seed", access: "i", type: "int" },
      { name: "count", access: "i", type: "int" },
      { name: "points", access: "o", type: "[]float2" },
    ],
  },
  {
    id: "/gen/range",
    label: "Float Range",
    desc: "Generates a sequence of numbers (arithmetic progression)",
    params: [
      { name: "start", access: "i", type: "float" },
      { name: "stop", access: "i", type: "float" },
      { name: "step", access: "i", type: "float" },
      { name: "out", access: "o", type: "[]float" },
    ],
  },
];

//------------------------------------------------------------------------------
// Noise Functions
//------------------------------------------------------------------------------

const noiseFns: FuncSpec[] = [
  {
    id: "/noise/perlin-2d",
    label: "Perlin Noise",
    desc: "Returns 2D Perlin values (-1 to 1)",
    params: [
      { name: "uv", access: "i", type: "[]float2" },
      { name: "scale", access: "i", type: "float" },
      { name: "seed", access: "i", type: "float" },
      { name: "val", access: "o", type: "[]float" },
    ],
  },
  {
    id: "/noise/simplex-3d",
    label: "Simplex 3D",
    desc: "Higher quality noise often used for time-based animation (XY + Time)",
    params: [
      { name: "uv", access: "i", type: "[]float2" },
      { name: "z", access: "i", type: "float" }, // Often used as time
      { name: "val", access: "o", type: "[]float" },
    ],
  },
  {
    id: "/noise/fbm",
    label: "Fractal Brownian Motion",
    desc: "Layered noise for cloud-like or mountainous textures",
    params: [
      { name: "uv", access: "i", type: "[]float2" },
      { name: "octaves", access: "i", type: "int" },
      { name: "persistence", access: "i", type: "float" },
      { name: "val", access: "o", type: "[]float" },
    ],
  },
  {
    id: "/noise/curl-2d",
    label: "Curl Noise",
    desc: "Calculates the curl of a noise field, perfect for flow fields",
    params: [
      { name: "uv", access: "i", type: "[]float2" },
      { name: "step", access: "i", type: "float" },
      { name: "vectors", access: "o", type: "[]float2" },
    ],
  },
  {
    id: "/noise/cellular",
    label: "Cellular (Worley) Noise",
    desc: "Returns distance to nearest points for crystalline patterns",
    params: [
      { name: "uv", access: "i", type: "[]float2" },
      { name: "val", access: "o", type: "[]float" },
    ],
  },
];

//------------------------------------------------------------------------------
//  Sampling Functions
//------------------------------------------------------------------------------

const samplingFns: FuncSpec[] = [
  {
    id: "/sampling/remap",
    label: "Remap Range",
    desc: "Maps a value from [sourceMin, sourceMax] to [targetMin, targetMax]",
    params: [
      { name: "val", access: "m", type: "[]float" },
      { name: "sMin", access: "i", type: "float" },
      { name: "sMax", access: "i", type: "float" },
      { name: "tMin", access: "i", type: "float" },
      { name: "tMax", access: "i", type: "float" },
    ],
  },
  {
    id: "/sampling/color-ramp",
    label: "Color Ramp",
    desc: "Maps a 0.0-1.0 float to a multi-stop color gradient",
    params: [
      { name: "t", access: "i", type: "[]float" },
      { name: "colors", access: "i", type: "[]float3" },
      { name: "stops", access: "i", type: "[]float" },
      { name: "out", access: "o", type: "[]float3" },
    ],
  },
  {
    id: "/sampling/threshold",
    label: "Step / Threshold",
    desc: "Returns 0 or 1 based on a threshold value",
    params: [
      { name: "val", access: "m", type: "[]float" },
      { name: "edge", access: "i", type: "float" },
    ],
  },
  {
    id: "/sampling/nearest-neighbor",
    label: "Nearest Point",
    desc: "Finds the closest point in a cloud to target points",
    params: [
      { name: "targets", access: "i", type: "[]float2" },
      { name: "cloud", access: "i", type: "[]float2" },
      { name: "indices", access: "o", type: "[]int" },
    ],
  },
];

//------------------------------------------------------------------------------
//  Vec2 Functions
//------------------------------------------------------------------------------

const vecFns: FuncSpec[] = [
  {
    id: "/vec2/add-force",
    label: "Add Force",
    desc: "Offsets points by a list of vectors (e.g., adding noise to position)",
    params: [
      { name: "points", access: "m", type: "[]float2" },
      { name: "vectors", access: "i", type: "[]float2" },
      { name: "strength", access: "i", type: "float" },
    ],
  },
  {
    id: "/vec2/rotate",
    label: "Rotate Around Pivot",
    desc: "Rotates points around a specific center coordinate",
    params: [
      { name: "points", access: "m", type: "[]float2" },
      { name: "center", access: "i", type: "float2" },
      { name: "angle", access: "i", type: "float" },
    ],
  },
  {
    id: "/vec2/look-at",
    label: "Look At Vector",
    desc: "Calculates angles between points and a target (for orienting shapes)",
    params: [
      { name: "points", access: "i", type: "[]float2" },
      { name: "target", access: "i", type: "float2" },
      { name: "angles", access: "o", type: "[]float" },
    ],
  },
  {
    id: "/vec2/normalize",
    label: "Normalize Vectors",
    desc: "Sets vector length to 1.0",
    params: [
      { name: "vecs", access: "m", type: "[]float2" },
    ],
  },
];

//------------------------------------------------------------------------------
//  Color Functions
//------------------------------------------------------------------------------

const colorFns: FuncSpec[] = [
  {
    id: "/color/hsv-to-rgb",
    label: "HSV to RGB",
    desc: "Convert Hue, Saturation, and Value to RGB float3",
    params: [
      { name: "h", access: "i", type: "[]float" }, // 0 to 360 or 0 to 1
      { name: "s", access: "i", type: "[]float" },
      { name: "v", access: "i", type: "[]float" },
      { name: "rgb", access: "o", type: "[]float3" },
    ],
  },
  {
    id: "/color/complementary",
    label: "Complementary Palette",
    desc: "Generate the opposite color on the wheel for each input",
    params: [
      { name: "base", access: "i", type: "[]float3" },
      { name: "out", access: "o", type: "[]float3" },
    ],
  },
  {
    id: "/color/analyze-brightness",
    label: "Luminance",
    desc: "Calculate the perceived brightness of colors (grayscale)",
    params: [
      { name: "rgb", access: "i", type: "[]float3" },
      { name: "lum", access: "o", type: "[]float" },
    ],
  },
  {
    id: "/color/blend",
    label: "Blend Colors",
    desc: "Mix two color lists based on factor T (Mix/Overlay/Multiply)",
    params: [
      { name: "a", access: "i", type: "[]float3" },
      { name: "b", access: "i", type: "[]float3" },
      { name: "t", access: "i", type: "[]float" },
      { name: "mode", access: "i", type: "string" }, // "mix", "multiply", "add"
      { name: "out", access: "o", type: "[]float3" },
    ],
  },
  {
    id: "/color/palette-analogous",
    label: "Analogous Palette",
    desc: "Generate colors adjacent to the base color on the wheel",
    params: [
      { name: "base", access: "i", type: "float3" },
      { name: "spread", access: "i", type: "float" },
      { name: "count", access: "i", type: "int" },
      { name: "palette", access: "o", type: "[]float3" },
    ],
  },
  {
    id: "/color/lerp-sequence",
    label: "Gradient Ramp",
    desc: "Generate a smooth sequence of colors from a list of stops",
    params: [
      { name: "stops", access: "i", type: "[]float3" },
      { name: "steps", access: "i", type: "int" },
      { name: "sequence", access: "o", type: "[]float3" },
    ],
  },
  {
    id: "/color/quantize",
    label: "Posterize / Quantize",
    desc: "Reduce colors to the nearest match from a provided palette",
    params: [
      { name: "input", access: "m", type: "[]float3" },
      { name: "palette", access: "i", type: "[]float3" },
    ],
  },
  {
    id: "/color/contrast-ratio",
    label: "Contrast Check",
    desc: "Calculate WCAG contrast ratio between two color lists",
    params: [
      { name: "fg", access: "i", type: "[]float3" },
      { name: "bg", access: "i", type: "[]float3" },
      { name: "ratio", access: "o", type: "[]float" },
    ],
  },
];

//------------------------------------------------------------------------------
//  Gen-Art Functions
//------------------------------------------------------------------------------

const artFns: FuncSpec[] = [
    {
        id: "/art/stipple-fill",
        label: "Stipple Points",
        desc: "Generate points within a mask based on a density map",
        params: [
            { name: "mask", access: "i", type: "[]float" },
            { name: "bounds", access: "i", type: "float4" },
            { name: "count", access: "i", type: "int" },
            { name: "points", access: "o", type: "[]float2" },
        ],
    },
    {
        id: "/art/voronoi-mesh",
        label: "Voronoi Diagram",
        desc: "Generates cell polygons from seed points",
        params: [
        { name: "seeds", access: "i", type: "[]float2" },
        { name: "bounds", access: "i", type: "float4" },
        { name: "cells", access: "o", type: "[][]float2" }, // Array of polygons
        ],
    },
    {
        id: "/art/recursive-subdiv",
        label: "Rect Subdivide",
        desc: "Splits a rectangle into smaller ones (Mondrian style)",
        params: [
        { name: "rect", access: "i", type: "float4" },
        { name: "iterations", access: "i", type: "int" },
        { name: "minSize", access: "i", type: "float" },
        { name: "rects", access: "o", type: "[]float4" },
        ],
    },
    {
        id: "/art/chaikin-smooth",
        label: "Chaikin Smoothing",
        desc: "Smoothes a rough polyline by corner cutting",
        params: [
        { name: "polyline", access: "m", type: "[]float2" },
        { name: "iterations", access: "i", type: "int" },
        ],
    },
    {
        id: "/art/l-system",
        label: "L-System Generator",
        desc: "Generates a string-based fractal path",
        params: [
        { name: "axiom", access: "i", type: "string" },
        { name: "rules", access: "i", type: "string" },
        { name: "depth", access: "i", type: "int" },
        { name: "path", access: "o", type: "[]float2" },
        ],
    },
];

//------------------------------------------------------------------------------
//  Array Functions
//------------------------------------------------------------------------------

const arrayFns: FuncSpec[] = [
    {
        id: "/array/shuffle",
        label: "Shuffle List",
        desc: "Randomly reorder a list of elements using a seed",
        params: [
        { name: "data", access: "m", type: "[]any" },
        { name: "seed", access: "i", type: "int" },
        ],
    },
    {
        id: "/array/slice",
        label: "Slice List",
        desc: "Extract a subset of a list",
        params: [
        { name: "data", access: "i", type: "[]any" },
        { name: "start", access: "i", type: "int" },
        { name: "end", access: "i", type: "int" },
        { name: "out", access: "o", type: "[]any" },
        ],
    },
];

//------------------------------------------------------------------------------
//  Export Functions
//------------------------------------------------------------------------------

const exportFns: FuncSpec[] = [
  {
    id: "/export/svg-path",
    label: "SVG Path",
    desc: "Converts a point array into an SVG <path> d-attribute",
    params: [
      { name: "points", access: "i", type: "[]float2" },
      { name: "closed", access: "i", type: "bool" },
      { name: "svgString", access: "o", type: "string" },
    ],
  },
  {
    id: "/export/canvas-draw",
    label: "Canvas Render",
    desc: "Draws circles/rects to an HTML5 Canvas context",
    params: [
      { name: "points", access: "i", type: "[]float2" },
      { name: "radii", access: "i", type: "[]float" },
      { name: "colors", access: "i", type: "[]float3" },
      { name: "ctx", access: "m", type: "canvas_context" },
    ],
  },
  {
    id: "/export/poly-to-svg",
    label: "SVG Polygons",
    desc: "Converts a nested list of polygons to SVG <polygon> tags",
    params: [
      { name: "polys", access: "i", type: "[][]float2" },
      { name: "fill", access: "i", type: "[]float3" },
      { name: "svgElements", access: "o", type: "[]string" },
    ],
  },
];

function getFunctionSpecs(): FuncSpec[] {
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
