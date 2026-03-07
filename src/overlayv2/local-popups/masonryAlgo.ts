/**
 * Split a line segment into allowed lengths such that they sum exactly to `total`.
 *
 * Uses dynamic programming to ensure feasibility and randomized weighted
 * selection to produce visually varied distributions of segment sizes.
 *
 * The algorithm prefers segment sizes that have been used less often in
 * the current solution, producing a more uniform distribution across sizes.
 *
 * @param total - Target sum of all segment lengths.
 * @param allowed - Allowed segment sizes (positive integers).
 * @param rng - Random number generator returning a float in [0,1).
 *
 * @returns Array of segment lengths whose sum equals `total`.
 *
 * @example
 * splitIntoAllowedSegments(50, [10,15,20], Math.random)
 * // -> [15,20,15]
 */
function splitIntoAllowedSegments(
  total: number,
  allowed: number[],
  rng: () => number
): number[] {
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

  if (!dp[total]) {
    throw new Error("No valid segmentation exists")
  }

  const result: number[] = []
  const usage = new Map<number, number>()
  sorted.forEach(v => usage.set(v, 0))

  let remaining = total

  while (remaining > 0) {
    const choices = sorted.filter(v => remaining - v >= 0 && dp[remaining - v])

    const weights = choices.map(v => 1 / (1 + (usage.get(v) ?? 0)))
    const weightSum = weights.reduce((a, b) => a + b, 0)

    let r = rng() * weightSum

    let chosen = choices[0]

    for (let i = 0; i < choices.length; i++) {
      r -= weights[i]
      if (r <= 0) {
        chosen = choices[i]
        break
      }
    }

    result.push(chosen)
    usage.set(chosen, (usage.get(chosen) ?? 0) + 1)

    remaining -= chosen
  }

  return result
}

