import { describe, expect, it } from "vitest";

import { createHitColorGen } from "./HitColorGen";

function pixel(r: number, g: number, b: number, a = 0xff): ImageData {
  return {
    data: new Uint8ClampedArray([r, g, b, a]),
    width: 1,
    height: 1,
    colorSpace: "srgb",
  } as ImageData;
}

function parseHexColor(color: string): { r: number; g: number; b: number; a: number } {
  expect(color).toMatch(/^#[0-9A-F]{8}$/);
  return {
    r: Number.parseInt(color.slice(1, 3), 16),
    g: Number.parseInt(color.slice(3, 5), 16),
    b: Number.parseInt(color.slice(5, 7), 16),
    a: Number.parseInt(color.slice(7, 9), 16),
  };
}

describe("HitColorGen", () => {
  it("matches the initial MSB-first sequence from the spec", () => {
    const gen = createHitColorGen();

    const first16 = Array.from({ length: 16 }, () => gen.next().col);

    expect(first16).toEqual([
      "#000080FF",
      "#008000FF",
      "#008080FF",
      "#800000FF",
      "#800080FF",
      "#808000FF",
      "#808080FF",
      "#000040FF",
      "#0000C0FF",
      "#008040FF",
      "#0080C0FF",
      "#800040FF",
      "#8000C0FF",
      "#808040FF",
      "#8080C0FF",
      "#004000FF",
    ]);
  });

  it("decodes generated colors back to the original index", () => {
    const gen = createHitColorGen();

    for (let i = 1; i <= 10000; i += 1) {
      const { id, col: color } = gen.next();
      expect(id).toBe(i);
      const { r, g, b, a } = parseHexColor(color);
      expect(a).toBe(0xff);
      expect(gen.indexOfPixel(pixel(r, g, b, a))).toBe(i);
    }
  });

  it("ignores lower channel bits not used yet during decoding", () => {
    const gen = createHitColorGen();

    for (let i = 0; i < 20; i += 1) {
      gen.next();
    }

    const { id, col: color } = gen.next(); // index 21, still using only 2 MSBs per channel
    expect(id).toBe(21);
    const { r, g, b } = parseHexColor(color);

    const noisyR = r | 0b0011_1111;
    const noisyG = g | 0b0001_1111;
    const noisyB = b | 0b0010_1111;

    expect(gen.indexOfPixel(pixel(noisyR, noisyG, noisyB, 0xff))).toBe(21);
  });

  it("getSnappedRgb strips channels to currently used MSBs", () => {
    const gen = createHitColorGen();

    // index 1..7 uses 1 bit per channel
    for (let i = 0; i < 7; i += 1) {
      gen.next();
    }

    expect(gen.getSnappedRgb(pixel(0xff, 0x7f, 0x81, 0xff))).toEqual({
      r: 0x80,
      g: 0x00,
      b: 0x80,
    });

    // index 8 starts using 2 bits per channel
    gen.next();
    expect(gen.getSnappedRgb(pixel(0xbf, 0x4f, 0xe0, 0xff))).toEqual({
      r: 0x80,
      g: 0x40,
      b: 0xc0,
    });
  });

  it("returns -1 for invalid alpha or color outside generated range", () => {
    const gen = createHitColorGen();

    gen.next();
    gen.next();

    expect(gen.indexOfPixel(pixel(0x00, 0x80, 0x00, 0x7f))).toBe(-1);

    // This would decode to index 4 in the 1-bit phase, but only indexes 1..2 exist.
    expect(gen.indexOfPixel(pixel(0x80, 0x00, 0x00, 0xff))).toBe(-1);

    // Pure black is reserved and should never map to a valid generated index.
    expect(gen.indexOfPixel(pixel(0x00, 0x00, 0x00, 0xff))).toBe(-1);
  });
});
