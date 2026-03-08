import { kDummyLorems, kDummyTitles } from "../../utils/dummyData";
import { makeRandomPicker } from "../../utils/random";
import type { CellData, ColumnLayoutData, MasonryLayoutData } from "./types";

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
  rng: () => number,
): number[][] {
  const cols: number[][] = Array.from({ length: columns }, () => []);
  const heights: number[] = new Array(columns).fill(0);

  const sorted = [...allowed].sort((a, b) => a - b);

  const dp: boolean[] = new Array(total + 1).fill(false);
  dp[0] = true;

  for (let i = 1; i <= total; i++) {
    for (const a of sorted) {
      if (i - a >= 0 && dp[i - a]) {
        dp[i] = true;
        break;
      }
    }
  }
  const canFill = (remaining: number) => dp[remaining];

  while (true) {
    const unfinished = heights
      .map((h, i) => ({ h, i }))
      .filter((x) => x.h < total);

    if (unfinished.length === 0) break;

    const startIdx = unfinished[Math.floor(rng() * unfinished.length)].i;

    const span = 1 + Math.floor(rng() * Math.min(3, columns - startIdx));

    const candidates = sorted.filter((v) =>
      Array.from({ length: span }).every((_, j) => {
        const col = startIdx + j;
        const remaining = total - (heights[col] + v);
        return remaining >= 0 && canFill(remaining);
      }),
    );

    if (candidates.length === 0) continue;

    const height = candidates[Math.floor(rng() * candidates.length)];

    for (let j = 0; j < span; j++) {
      const col = startIdx + j;
      cols[col].push(height);
      heights[col] += height;
    }
  }

  return cols;
}

/**
 * Create a grid of cell info from the raw cell heights, by adding
 * cell-level attributes like color, text etc.
 *
 * @param grid 2D grid of cell heights.
 * @param seed Seeds the RNGs used for color, text etc.
 */
export function gridToCellData(
  grid: number[][],
  seed: number,
): MasonryLayoutData {
  const colorPicker = makeRandomPicker(kCellColors, seed + 32);
  const titlePicker = makeRandomPicker(kDummyTitles, seed + 37);
  const loremPicker = makeRandomPicker(kDummyLorems, seed + 43);

  const result: MasonryLayoutData = [];
  for (const column of grid) {
    const resultRow: ColumnLayoutData = column.map((w: number): CellData => {
      const weightY = w;
      const bgcolor = colorPicker.pick();
      const title = titlePicker.pick();
      const lorem = loremPicker.pick();
      return { weightY, bgcolor, title, lorem };
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
