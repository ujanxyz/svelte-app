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
    t += 0x6d2b79f5;
    let x = t;

    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);

    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
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
 * const picker = makeRandomPicker(["a", "b", "c"], 42);
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
export function makeRandomPicker<T>(
  values: T[],
  seed: number,
): { pick: () => T } {
  const rng = createRNG(seed);
  function pick(): T {
    const index = ((rng() * 100000) | 0) % values.length;
    return values[index];
  }
  return { pick };
}

/**
 * Creates a circular picker that returns values from a list sequentially.
 *
 * Each call to {@link pick} returns the next value in the provided array.
 * When the end of the array is reached, the picker wraps around to the
 * beginning, forming a continuous circular sequence.
 *
 * The picker maintains its own internal index state.
 *
 * @typeParam T - The type of values stored in the picker.
 *
 * @param values - Array of values to cycle through.
 *
 * @returns An object containing a {@link pick} function that retrieves
 * the next value in the circular sequence.
 *
 * @example
 * ```ts
 * const picker = makeCircularPicker(["A", "B", "C"], 0);
 *
 * picker.pick(); // "A"
 * picker.pick(); // "B"
 * picker.pick(); // "C"
 * picker.pick(); // "A"
 * ```
 */
export function makeCircularPicker<T>(values: T[]): { pick: () => T } {
  let index = 0;
  function pick(): T {
    const picked = values[index];
    index = (index + 1) % values.length;
    return picked;
  }
  return { pick };
}
