/**
 * HitColorGen generates deterministic color keys for canvas hit-testing using a
 * reversible 24-bit permutation between integer index space and RGB space.
 *
 * Core idea:
 * - We keep alpha fixed to 0xFF and only encode in RGB (24 bits total).
 * - Index starts at 1; pure black (0) is reserved as invalid/no-hit.
 * - For small index ranges, only the most-significant bits of R/G/B are used,
 *   producing more visually distinct early colors.
 *
 * Bit mapping (index -> RGB):
 * - Index source bits are consumed in groups of 3 in order: B, G, R.
 * - Group/"level" 0 maps to bit 7 (MSB) of each channel,
 *   level 1 maps to bit 6, ..., level 7 maps to bit 0.
 * - This is a one-to-one permutation on 24 bits, so decoding is exact.
 *
 * Decoding optimization:
 * - If generated colors have used only k MSBs per channel so far, decoding can
 *   ignore all lower bits by snapping channels with a mask and reading only k levels.
 *
 * Example:
 * ```ts
 * const gen = createHitColorGen();
 * const { id, col } = gen.next(); // e.g. { id: 1, col: "#000080FF" }
 *
 * // During pointer readback from a 1x1 hit canvas pixel:
 * const idx = gen.indexOfPixel(imageData);
 * if (idx !== -1) {
 *   // idx identifies the element deterministically
 * }
 * ```
 */
export interface HitColorGen {
  /**
   * Generates the next unique hit-test id/color pair.
   *
   * - Index sequence starts at 1 (black is reserved for "no hit").
   * - Returns `{ id, col }` where `col` is uppercase `#RRGGBBAA` with alpha `FF`.
   */
  next(): { id: number; col: string };

  /**
   * Returns the RGB value snapped to the currently used MSB depth.
   *
   * This strips lower, currently-unused channel bits so callers can inspect
   * exactly what `indexOfPixel` will consider during decoding.
   */
  getSnappedRgb(pixel: ImageData): Rgb;

  /**
   * Decodes a 1x1 hit pixel to its generated index.
   *
   * Returns `-1` when the pixel is invalid (non-opaque alpha), maps to black,
   * or decodes outside the range generated so far.
   */
  indexOfPixel(pixel: ImageData): number;
}

const MAX_INDEX = 0xffffff;

type Rgb = { r: number; g: number; b: number };

type PixelChannels = { r: number; g: number; b: number; a: number };

function toHex2(value: number): string {
  return value.toString(16).padStart(2, "0").toUpperCase();
}

function indexToRgb(index: number): Rgb {
  let r = 0;
  let g = 0;
  let b = 0;

  for (let srcBit = 0; srcBit < 24; srcBit += 1) {
    if (((index >> srcBit) & 1) === 0) continue;

    const level = Math.floor(srcBit / 3);
    const channel = srcBit % 3; // 0=B, 1=G, 2=R
    const targetBit = 7 - level;

    if (channel === 0) b |= 1 << targetBit;
    else if (channel === 1) g |= 1 << targetBit;
    else r |= 1 << targetBit;
  }

  return { r, g, b };
}

function rgbToIndexWithUsedBits(r: number, g: number, b: number, usedBitsPerChannel: number): number {
  let index = 0;

  for (let level = 0; level < usedBitsPerChannel; level += 1) {
    const bitPos = 7 - level;
    const bBit = (b >> bitPos) & 1;
    const gBit = (g >> bitPos) & 1;
    const rBit = (r >> bitPos) & 1;

    index |= bBit << (level * 3);
    index |= gBit << (level * 3 + 1);
    index |= rBit << (level * 3 + 2);
  }

  return index;
}

function readPixelChannels(pixel: ImageData): PixelChannels | null {
  const data = pixel?.data;
  if (!data || data.length < 4) return null;

  return {
    r: data[0] ?? 0,
    g: data[1] ?? 0,
    b: data[2] ?? 0,
    a: data[3] ?? 0,
  };
}

function snapRgbWithUsedBits(rgb: Rgb, usedBitsPerChannel: number): Rgb {
  if (usedBitsPerChannel <= 0) return { r: 0, g: 0, b: 0 };
  if (usedBitsPerChannel >= 8) return rgb;

  const mask = (0xff << (8 - usedBitsPerChannel)) & 0xff;
  return {
    r: rgb.r & mask,
    g: rgb.g & mask,
    b: rgb.b & mask,
  };
}

function bitsUsedForIndex(index: number): number {
  if (index <= 0) return 0;
  const bitLength = Math.floor(Math.log2(index)) + 1;
  return Math.min(8, Math.ceil(bitLength / 3)) | 0;
}

/**
 * Creates a stateful hit-color generator and decoder.
 *
 * Internal state tracks:
 * - the current generated index counter
 * - how many MSBs per channel are active for decode/snap
 */
export function createHitColorGen(): HitColorGen {
  let counter = 0;
  let usedBitsPerChannel = 0;

  return {
    next(): { id: number; col: string } {
      if (counter >= MAX_INDEX) {
        throw new Error("HitColorGen exhausted: maximum 24-bit color-space reached");
      }

      counter += 1;
      usedBitsPerChannel = bitsUsedForIndex(counter);

      const { r, g, b } = indexToRgb(counter);
      return {
        id: counter,
        col: `#${toHex2(r)}${toHex2(g)}${toHex2(b)}FF`,
      };
    },

    getSnappedRgb(pixel: ImageData): Rgb {
      const channels = readPixelChannels(pixel);
      if (!channels) return { r: 0, g: 0, b: 0 };
      return snapRgbWithUsedBits(
        { r: channels.r, g: channels.g, b: channels.b },
        usedBitsPerChannel,
      );
    },


    indexOfPixel(pixel: ImageData): number {
      if (usedBitsPerChannel === 0) return -1;
      const channels = readPixelChannels(pixel);
      if (!channels) return -1;

      if (channels.a !== 0xff) return -1;

      const snapped = snapRgbWithUsedBits(
        { r: channels.r, g: channels.g, b: channels.b },
        usedBitsPerChannel,
      );

      const index = rgbToIndexWithUsedBits(snapped.r, snapped.g, snapped.b, usedBitsPerChannel);
      if (index < 1 || index > counter) return -1;
      return index;
    },
  };
}
