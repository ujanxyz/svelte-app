# HitColorGen

Implement a Typescript library `HitColorGen` to generate colors for hit test as in Konva's color-keyed hit detection

Konva generates a random color, and snaps it to color buckets. But we take a more robust approach, describe below.

We start with as few bits as possible in the red (R), green (G) and blue (B) channels starting with the most significant bit. The alpha channel is always opaque (i.e. uses fixed octet 0xFF) otherwise hit detection would fail, so the computation involves only the three RGB octets. For e.g.

Values 0 to 7 (2^3-1): Uses most significant 1 bit of RGB octets
Values 0 to 63 (2^6-1): Uses most significant 2 bits of RGB octets
Values 0 to 511 (2^9-1): Uses most significant 3 bits of RGB octets
.. and so on

The idea is most pages have few elements, the chances of having large number of elements become small. So we want to select the first few colors as distinct as possible.

At the heart of the logic is a one-to-one mapping, a bitwise permutation, from a 2^24 bit counter to another 2^24 bit number which is the RGB octet triplet.
The encoding uses the above logic, decoding should be the reverse algorithm and recover the original counter. This relieves us of the burden to save the coder-key to elemet mapping. To make things simpler we simply use the encoded id (RGB octet-triplet) as the element id, but re-encode as Base-62 char.

Let's go through some concrete examples:
Suppose the RGB triplet is represented as `[00000000 - 00000000 - 00000000]`
The generated encoded numbers will start at 1 (exclude pure black)
`[00000000 - 00000000 - 10000000]`
`[00000000 - 10000000 - 00000000]`
`[00000000 - 10000000 - 10000000]`
`[10000000 - 00000000 - 00000000]`
`[10000000 - 00000000 - 10000000]`
`[10000000 - 10000000 - 00000000]`
`[10000000 - 10000000 - 10000000]`
`[00000000 - 00000000 - 01000000]`
`[00000000 - 00000000 - 11000000]`
`[00000000 - 10000000 - 01000000]`
`[00000000 - 10000000 - 11000000]`
`[10000000 - 00000000 - 01000000]`
`[10000000 - 00000000 - 11000000]`
`[10000000 - 10000000 - 01000000]`
`[10000000 - 10000000 - 11000000]`
`[00000000 - 01000000 - 0000000]`
`[00000000 - 01000000 - 1000000]`
`[00000000 - 11000000 - 00000000]`
`[00000000 - 11000000 - 10000000]`
`[10000000 - 01000000 - 00000000]`
`[10000000 - 01000000 - 10000000]`
`[10000000 - 11000000 - 00000000]`
`[10000000 - 11000000 - 10000000]`
. . .

Implement this color generator cum encode / decode library.

```typescript
interface HitColorGen {
  // Generates the next id/color pair from encoded value of the incremented internal counter.
  // First valid index starts from 1.
  // After generation it remember how many MSB bits (from RGB ocets) were actually used, and
  // during decoding it will use only those many bits.
  next(): { id: number; col: string };

  // Given a 1x1 pixel color, lookup the index. Returns -1 if invalid.
  // If the generated colors used up to 3 MSB bits of RGB octets so far, then no need
  // to process more than 3 MSB bits of the RGB channel of the pixel value.
  indexOfPixel(pixel: ImageData): number;
}
```

Implements this library, ideally a stateful fuction that returns `{next, indexOfPixel}`.
Add unit tests.
