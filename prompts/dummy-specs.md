# Generate Dummy Function Specs

Study the following typescript spec describing function nodes in a node-based
execution graph. This pertains only to the function specs, its params (input,
output, mutable), and not the actual impementation nor defining the actual data types.

The interface is provided, with some dummy function specs in few categories. Your tasks are:
- Suggest more categories, ask for confirmation.
- Generate several new functions in each categories. Output as JS / TS object array literals
like the given array `dummyData`.
- If it makes cleaner, group specs by category and join using the spread syntax, like
 `[...mathFns, ...utilFns, ...statFns, ...]` and wrap inside a function that returns a giant array
 of such function specs.
- Try to give as many realistic examples as possible, think of how geometry-nodes in blender operate conceptually.
- Think hard and share the plan first.

```typescript
interface FuncParam {
  name: string;
  // Param type: input / output / mutate
  // Input params are read-only, output params are created from scratch.
  // Mutable params are both read and modified.
  access: "i" | "o" | "m";
  // The data type. Left as free string for implementation. "[]T" denotes array of type T.
  // Common values are:
  // int, int[], float, []float.
  // Geometric types like: 2D coordinates (pair of x,y), intervals are represented as "float2" (2 floats).
  // Rectangles are represented as "float4".
  // Colors are represented as "float3" (for RGB).
  type: string;
};

interface FuncInfo {
  id: string;
  label: string;
  desc: string;
  params: FuncParam[];
};

const dummyData: FuncInfo[] = [
    {
        id: "/math/sum",
        label: "Sum",
        desc: "Sum of two numeric lists, assumes zeroes from the shorter list",
        params: [
          { name: "x", access: "i", type: "[]float" },
          { name: "y", access: "i", type: "[]float" },
          { name: "s", access: "o", type: "[]floats" },
        ],
    },
    {
        id: "/math/cos",
        label: "Cosine (Trigonometry)",
        desc: "Computes the cosine of a list of numbers",
        params: [
          { name: "x", access: "i", type: "[]float" },
          { name: "fx", access: "o", type: "[]float" },
        ],
    },
    {
        id: "/util/partition-interval",
        label: "Partition interval",
        desc: "Partition a given interval to a list of 'n' intervals",
        params: [
          { name: "intrvl", access: "i", type: "float2" },
          { name: "n", access: "i", type: "int" },
          { name: "partitions", access: "o", type: "[]float2" },
        ],
    },
    {
        id: "/geom2d/union-bounding-box",
        label: "Bounding Box Union",
        desc: "Compute the union of 'n' bounding boxes",
        params: [
          { name: "boxes", access: "i", type: "[]float4" },
          { name: "rbox", access: "o", type: "float4" },
        ],
    },
    {
        id: "/stats/to-z-values",
        label: "Normalize to Z-values",
        desc: "Normalize a lsist of number to Z-values, i.e. (X-mean(X))/stddev(X)",
        params: [
          { name: "x", access: "i", type: "[]float" },
          { name: "z", access: "o", type: "[]float" },
        ],
    },
    {
        id: "/color/gen-gradient",
        label: "Lerped Colors",
        desc: "Generate a gradient of n colors between a given a pair of colors",
        params: [
          { name: "start", access: "i", type: "float3" },
          { name: "end", access: "i", type: "float3" },
          { name: "t", access: "i", type: "[]float" },
          { name: "colors", access: "o", type: "[]float3" },
        ],
    },
    // TODO: Add several more function descriptions here:
    // Some suggestions are:
    // "/math": functions: min, max, lerped value
    // "/random": Generate N random numbers (takes seed), uniform and normal distributions.
    // "/color": Convert to HSV, Extract hue value.
    // "/geom2d": Generate n random rectangles enclosed in a given canvas dimension.
];
```