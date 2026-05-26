
/**
 * RGBA8 image payload exchanged between WASM and worker-side WebGPU code.
 */
export interface WgpuImage {
  width: number;
  height: number;
  pixels: Uint8Array;
}

/**
 * Unified WebGPU task model.
 *
 * - `targetImage` is the output image/buffer destination.
 * - `inImages` is an optional list of input images (0..N).
 * - `fragShader` is the fragment shader code to execute.
 */
export interface WgpuTask {
  inImages: WgpuImage[];
  targetImage: WgpuImage;
  fragShader: string;
}
