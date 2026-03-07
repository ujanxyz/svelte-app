import type { CellData, ColumnLayoutData, MasonryLayoutData } from "./types";

/**
 * Creates a fast deterministic pseudo-random number generator.
 *
 * Uses the Mulberry32 algorithm.
 * - Very fast
 * - Deterministic for the same seed
 * - Returns numbers in the range [0, 1)
 *
 * @param seed Any 32-bit integer seed
 * @returns Function that returns a pseudo-random number in [0, 1)
 *
 * @example
 * const rng = createRNG(12345);
 * console.log(rng()); // always same sequence for same seed
 */
export function createRNG(seed: number): () => number {
  let t = seed >>> 0;

  return function rng(): number {
    t += 0x6D2B79F5;
    let x = t;

    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);

    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a k-column masonry grid layout.
 *
 * Each column will contain segment heights that sum exactly to `total`.
 * Unlike naive generators that build columns independently, this algorithm
 * creates horizontal "rows" that may span multiple columns. This produces
 * more natural staggered masonry layouts where column breakpoints differ.
 *
 * A feasibility DP check ensures the remaining height of each column can
 * still be completed using the allowed segment sizes.
 *
 * @param columns - Number of masonry columns.
 * @param total - Total height each column must sum to.
 * @param allowed - Allowed segment heights.
 * @param rng - Random number generator returning float in [0,1).
 *
 * @returns Array of columns, where each column is an array of segment heights.
 *
 * @example
 * genMasonryColumns(3, 200, [10,15,20,25], Math.random)
 *
 * // [
 * //   [25,20,15,20,25,10,20,25,20,20],
 * //   [20,15,25,20,20,25,10,20,25,20],
 * //   [25,20,20,15,25,20,10,20,20,25]
 * // ]
 */
export function genMasonryColumns(
  columns: number,
  total: number,
  allowed: number[],
  rng: () => number
): number[][] {
  const cols: number[][] = Array.from({ length: columns }, () => [])
  const heights: number[] = new Array(columns).fill(0)

  const sorted = [...allowed].sort((a, b) => a - b)

  const dp: boolean[] = new Array(total + 1).fill(false)
  dp[0] = true

  for (let i = 1; i <= total; i++) {
    for (const a of sorted) {
      if (i - a >= 0 && dp[i - a]) {
        dp[i] = true
        break
      }
    }
  }

  const canFill = (remaining: number) => dp[remaining]

  while (true) {
    const unfinished = heights
      .map((h, i) => ({ h, i }))
      .filter(x => x.h < total)

    if (unfinished.length === 0) break

    const startIdx = unfinished[Math.floor(rng() * unfinished.length)].i

    const span = 1 + Math.floor(rng() * Math.min(3, columns - startIdx))

    const candidates = sorted.filter(v =>
      Array.from({ length: span }).every((_, j) => {
        const col = startIdx + j
        const remaining = total - (heights[col] + v)
        return remaining >= 0 && canFill(remaining)
      })
    )

    if (candidates.length === 0) continue

    const height = candidates[Math.floor(rng() * candidates.length)]

    for (let j = 0; j < span; j++) {
      const col = startIdx + j
      cols[col].push(height)
      heights[col] += height
    }
  }

  return cols
}

/**
 * Creates a deterministic random sampler for a given set of values.
 *
 * The returned picker selects a random element from the provided `values`
 * array each time `pick()` is called. The randomness is **seeded**, meaning
 * the same `seed` will always produce the same sequence of picks. This is
 * useful for reproducible UI testing, procedural generation, or simulations.
 *
 * Internally it uses a seeded RNG (`createRNG`) and converts the generated
 * float to an index within the `values` array.
 *
 * @template T Type of elements in the values array.
 *
 * @param values - Array of candidate values to randomly pick from.
 * @param seed - Seed used to initialize the deterministic random number generator.
 *
 * @returns An object containing a `pick()` method that returns a sampled value.
 *
 * @example
 * ```ts
 * const picker = makeSamplePicker(["a", "b", "c"], 42);
 *
 * picker.pick(); // "b"
 * picker.pick(); // "a"
 * picker.pick(); // "c"
 * ```
 *
 * @remarks
 * - The sequence of returned values is deterministic for a given seed.
 * - If `values.length === 0`, the behavior is undefined.
 * - Designed for lightweight sampling, not cryptographic randomness.
 */
export function makeSamplePicker<T>(values: T[], seed: number) {
  const rng = createRNG(seed);
  function pick(): T {
    const index = ((rng() * 100000)|0) % values.length;
    return values[index];
  }
  return {pick};
}

/**
 * Create a grid of cell info from the raw cell heights, by adding
 * cell-level attributes like color, text etc.
 *
 * @param grid 2D grid of cell heights.
 * @param seed Seeds the RNGs used for color, text etc.
 */
export function gridToCellData(grid: number[][], seed: number): MasonryLayoutData {
  const colorPicker = makeSamplePicker(kCellColors, seed + 32);
  const titlePicker = makeSamplePicker(kCellTitles, seed + 37);
  const loremPicker = makeSamplePicker(kCellLorems, seed + 43);

  const result: MasonryLayoutData = [];
  for (const column of grid) {
    const resultRow: ColumnLayoutData = column.map((w: number): CellData => {
      const weightY = w;
      const bgcolor = colorPicker.pick();
      const title = titlePicker.pick();
      const lorem = loremPicker.pick();
      return {weightY, bgcolor, title, lorem};
    });
    result.push(resultRow);
  }
  return result;
}

const kCellColors = [
  "#E11D48", // rose red
  "#EA580C", // deep orange
  "#9333EA", // purple
  "#7C3AED", // violet
  "#E11D8D", // fuchsia pink
  "#2563EB", // blue
  "#16A34A", // green
  "#CA8A04", // mustard amber
];

const kCellTitles = [
  "Quick Brown Fox",
  "Silent Ocean Waves",
  "Hidden Mountain Trail",
  "Golden Evening Light",
  "Lost City Ruins",
  "Midnight Coding Session",
  "Bright Summer Sky",
  "Rustic Wooden Bridge",
  "Neon City Nights",
  "Ancient Desert Path",
  "Whispering Pine Forest",
  "Falling Autumn Leaves",
  "Crystal Clear Lake",
  "Storm Over Horizon",
  "Quiet Village Morning",
  "Endless Sand Dunes",
  "Frozen Northern Wind",
  "Blooming Spring Garden",
  "Shadows and Lanterns",
  "Last Train Home"
];

const kCellLorems = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel ligula scelerisque.",
  "Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Donec sollicitudin molestie malesuada.",
  "Vivamus suscipit tortor eget felis porttitor volutpat. Nulla quis lorem ut libero malesuada feugiat.",
  "Pellentesque in ipsum id orci porta dapibus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices.",
  "Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Nulla porttitor accumsan tincidunt.",
  "Donec rutrum congue leo eget malesuada. Cras ultricies ligula sed magna dictum porta.",
  "Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui. Proin eget tortor risus.",
  "Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem.",
  "Sed porttitor lectus nibh. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui.",
  "Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Curabitur aliquet quam id dui posuere.",
  "Quisque velit nisi, pretium ut lacinia in, elementum id enim.",
  "Nulla quis lorem ut libero malesuada feugiat. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a.",
  "Sed porttitor lectus nibh. Donec sollicitudin molestie malesuada. Cras ultricies ligula sed magna dictum porta.",
  "Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Pellentesque in ipsum id orci porta dapibus.",
  "Donec rutrum congue leo eget malesuada. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui.",
  "Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus. Donec sollicitudin molestie malesuada.",
  "Pellentesque in ipsum id orci porta dapibus. Cras ultricies ligula sed magna dictum porta.",
  "Praesent sapien massa, convallis a pellentesque nec, egestas non nisi.",
  "Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Curabitur aliquet quam id dui posuere blandit.",
  "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec velit neque."
];