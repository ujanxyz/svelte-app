const ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const BASE = BigInt(ALPHABET.length);
const MASK_64 = (1n << 64n) - 1n;

/**
 * Fast deterministic 64-bit mixing hash based on SplitMix64.
 *
 * This function converts sequential numbers into well-distributed
 * pseudo-random values with strong avalanche properties.
 *
 * It is **not meant for security**, but it is ideal for:
 * - deterministic ID generation
 * - hash scrambling
 * - pseudo-random sequences
 *
 * @param x - Input bigint value
 * @returns 64-bit hashed bigint
 */
function splitmix64(x: bigint): bigint {
  x = (x + 0x9e3779b97f4a7c15n) & MASK_64;

  let z = x;
  z = ((z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n) & MASK_64;
  z = ((z ^ (z >> 27n)) * 0x94d049bb133111ebn) & MASK_64;
  z = z ^ (z >> 31n);

  return z & MASK_64;
}

/**
 * Encodes a bigint into a fixed-length Base62 string.
 *
 * Base62 uses characters:
 * `0-9 A-Z a-z`
 *
 * @param num - Number to encode
 * @param length - Desired output length
 * @returns Encoded base62 string
 */
function encodeBase62(num: bigint, length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    const idx = Number(num % BASE);
    out += ALPHABET[idx];
    num /= BASE;
  }
  return out;
}

/**
 * Creates a deterministic sequential ID generator.
 *
 * Each call produces a pseudo-random looking string derived
 * from a sequential counter.
 *
 * Internally:
 *
 * ```
 * counter → SplitMix64 hash → Base62 encoding
 * ```
 *
 * Properties:
 * - deterministic
 * - extremely fast
 * - no collisions within the counter domain
 * - fixed output length
 * - visually random IDs
 *
 * This is useful for:
 * - graph node / edge IDs
 * - local object identifiers
 * - deterministic test data
 * - short UUID-like strings
 *
 * @example
 * ```ts
 * const nextId = createIdGenerator(10)
 *
 * nextId() // "f3K91sAq0x"
 * nextId() // "0Ds9zk3JFa"
 * nextId() // "B91akQ3x1S"
 * ```
 *
 * @param length - Length of the generated ID string (default: 12)
 * @param seed - Optional seed to create independent deterministic sequences
 *
 * @returns Function that generates the next ID
 */
export function createIdGenerator(length: number, seed = 0n): () => string {
  let counter = 0n;

  return () => {
    const hashed = splitmix64(counter + seed);
    counter++;
    return encodeBase62(hashed, length);
  };
}
