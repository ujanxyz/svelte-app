
/**
 * Task template types for WebGPU processing.
 * Each template defines a specific shader I/O pattern.
 */
export enum WgpuTaskType {
  /**
   * Output-only: Generates pixels via shader, stores in output buffer.
   * Shader has no input textures.
   */
  OUTPUT_ONLY = 'OUTPUT_ONLY',

  /**
   * Input and output: Reads one input texture, writes to output buffer.
   * Shader receives input texture and outputs pixels.
   */
  INPUT_AND_OUTPUT = 'INPUT_AND_OUTPUT',

  // TODO: TWO_INPUTS = 'TWO_INPUTS',
  // TODO: UNIFORM_AND_OUTPUT = 'UNIFORM_AND_OUTPUT',
  // TODO: MULTI_INPUT_OUTPUT = 'MULTI_INPUT_OUTPUT',
}

/**
 * Base interface for all WebGPU tasks.
 */
export interface BaseWgpuTask {
  type: WgpuTaskType;
  shaderCode?: string;
}

/**
 * Output-only task: generates a bitmap via shader with no input textures.
 */
export interface OutputOnlyTask extends BaseWgpuTask {
  type: WgpuTaskType.OUTPUT_ONLY;
  width: number;
  height: number;
  pixels: Uint8Array;
}

/**
 * Input-and-output task: reads one input bitmap as texture, writes output to buffer.
 * srcWidth, srcHeight, srcPixels define the input texture.
 * width, height, pixels define the output buffer.
 */
export interface InputAndOutputTask extends BaseWgpuTask {
  type: WgpuTaskType.INPUT_AND_OUTPUT;
  width: number;
  height: number;
  pixels: Uint8Array;
  srcWidth: number;
  srcHeight: number;
  srcPixels: Uint8Array;
}

/**
 * Union type for all supported task templates.
 */
export type WgpuTask = OutputOnlyTask | InputAndOutputTask;

/**
 * Legacy interface: kept for backward compatibility.
 * New code should use WgpuTask.
 */
export interface PixelTask {
  width: number;
  height: number;
  pixels: Uint8Array;
}