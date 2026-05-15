import type { flow } from "@/types/flow";
import type { wa } from "@/types/wa";

import { processInputAndOutputTemplate } from "./templates/templateInputAndOutput";
import { processOutputOnlyTemplate } from "./templates/templateOutputOnly";
import type { InputAndOutputTask, OutputOnlyTask, WgpuTask } from "./types";
import { WgpuTaskType } from "./types";

/**
 * WgpuTaskManager orchestrates WebGPU task execution.
 * Routes tasks to appropriate template handlers based on task type.
 */
class WgpuTaskManager {
  private readonly wgpuTaskPool: wa.WebGpuTaskPoolInterface;

  public constructor(wgpuTaskPool: wa.WebGpuTaskPoolInterface) {
    this.wgpuTaskPool = wgpuTaskPool;
  }

  public async fulfillTask(workId: string): Promise<void> {
    console.log("[WgpuTaskManager] Fulfilling work id: ", workId);

    console.time("wgpu-fulfill");

    const rawTask = this.wgpuTaskPool.getTaskData(workId);
    if (!rawTask) {
      console.error(`[WgpuTaskManager] No task data found for workId: ${workId}`);
      return;
    }

    try {
      // Infer task type from raw data and route to appropriate handler
      const task = await this._inferAndRouteTask(rawTask);
      console.log("[WgpuTaskManager] Routed to handler, workId:", workId);

      this.wgpuTaskPool.fulfillTask(workId, task);
    } catch (error) {
      console.error(`[WgpuTaskManager] Error fulfilling task ${workId}:`, error);
    }

    console.timeEnd("wgpu-fulfill");
  }

  /**
   * Infer task type from raw data and route to appropriate template handler.
   * If explicit type field is missing, detect based on field presence.
   */
  private async _inferAndRouteTask(rawTask: unknown): Promise<WgpuTask> {
    const task = rawTask as Record<string, unknown>;
    const taskType = task.type as WgpuTaskType;
    if (typeof taskType !== 'string' || !(taskType in WgpuTaskType)) {
      throw new Error(`[WgpuTaskManager] Invalid or missing task type: ${task.type}`);
    }
    const shaderCode = (task.shaderCode as string) || this._getDefaultFragmentShaderForType(taskType);
    
    // Explicit type field takes precedence
    switch (taskType) {
    case WgpuTaskType.OUTPUT_ONLY: {
        const outTask: OutputOnlyTask = {
        type: WgpuTaskType.OUTPUT_ONLY,
        width: task.width as number,
        height: task.height as number,
        pixels: task.pixels as Uint8Array,
        shaderCode,
        };
        await this._processOutputOnly(outTask, shaderCode);
        return outTask;
    }

    case WgpuTaskType.INPUT_AND_OUTPUT: {
        const inOutTask: InputAndOutputTask = {
        type: WgpuTaskType.INPUT_AND_OUTPUT,
        width: task.width as number,
        height: task.height as number,
        pixels: task.pixels as Uint8Array,
        srcWidth: task.srcWidth as number,
        srcHeight: task.srcHeight as number,
        srcPixels: task.srcPixels as Uint8Array,
        shaderCode,
        };
        const finalShader = shaderCode || this._getDefaultFragmentShaderForType(WgpuTaskType.INPUT_AND_OUTPUT);
        await this._processInputAndOutput(inOutTask, finalShader);
        return inOutTask;
    }

    default:
        throw new Error(`[WgpuTaskManager] Unknown task type: ${taskType}`);
    }
  }

  /**
   * Get a sensible default vertex shader for a given task type.
   */
  private _getDefaultVertexShaderForType(type: WgpuTaskType): string {
    switch (type) {
      case WgpuTaskType.OUTPUT_ONLY:
        return this._getDefaultOutputOnlyVertexShader();
      case WgpuTaskType.INPUT_AND_OUTPUT:
        return this._getDefaultInputAndOutputVertexShader();
      default:
        throw new Error(`No default vertex shader for task type: ${type}`);
    }
  }

  /**
   * Get a sensible default fragment shader for a given task type.
   */
  private _getDefaultFragmentShaderForType(type: WgpuTaskType): string {
    switch (type) {
      case WgpuTaskType.OUTPUT_ONLY:
        return this._getDefaultOutputOnlyFragmentShader();
      case WgpuTaskType.INPUT_AND_OUTPUT:
        return this._getDefaultInputAndOutputFragmentShader();
      default:
        throw new Error(`No default fragment shader for task type: ${type}`);
    }
  }

  /**
   * Default vertex shader for OUTPUT_ONLY: fullscreen triangle.
   */
  private _getDefaultOutputOnlyVertexShader(): string {
    return `@vertex fn main(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
  var pos = array<vec2f, 3>(vec2(-1, -1), vec2(3, -1), vec2(-1, 3));
  return vec4f(pos[i], 0.0, 1.0);
}`;
  }

  /**
   * Default fragment shader for OUTPUT_ONLY: grid pattern with tile colors.
   */
  private _getDefaultOutputOnlyFragmentShader(): string {
    return `@fragment
fn main(@builtin(position) coord: vec4f) -> @location(0) vec4f {
  let x = coord.x;
  let y = coord.y;
  let grid_size: f32 = 32.0;
  let is_grid_line: bool = (f32(u32(x) % u32(grid_size)) < 1.0) || 
                           (f32(u32(y) % u32(grid_size)) < 1.0);
  
  if (is_grid_line) {
    return vec4f(1.0, 1.0, 1.0, 1.0);
  }
  
  let tile_x = floor(x / grid_size);
  let tile_y = floor(y / grid_size);
  let r = (tile_x * 13.0 % 255.0) / 255.0;
  let g = (tile_y * 7.0 % 255.0) / 255.0;
  let b = ((tile_x + tile_y) * 3.0 % 255.0) / 255.0;
  
  return vec4f(r, g, b, 1.0);
}`;
  }

  /**
   * Default vertex shader for INPUT_AND_OUTPUT: fullscreen triangle.
   */
  private _getDefaultInputAndOutputVertexShader(): string {
    return `@vertex fn main(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
  var pos = array<vec2f, 3>(vec2(-1, -1), vec2(3, -1), vec2(-1, 3));
  return vec4f(pos[i], 0.0, 1.0);
}`;
  }

  /**
   * Default fragment shader for INPUT_AND_OUTPUT: left half passthrough, right half inverted.
   */
  private _getDefaultInputAndOutputFragmentShader(): string {
    return `@group(0) @binding(0) var input_texture: texture_2d<f32>;
@group(0) @binding(1) var input_sampler: sampler;

@fragment
fn main(@builtin(position) coord: vec4f) -> @location(0) vec4f {
  let uv = coord.xy / vec2f(textureDimensions(input_texture));
  let color = textureSample(input_texture, input_sampler, uv);

  if (uv.x < 0.5) {
    return color;
  }

  return vec4f(1.0 - color.r, 1.0 - color.g, 1.0 - color.b, color.a);
}`;
  }

  /**
   * Dispatch OUTPUT_ONLY task to template handler.
   */
  private async _processOutputOnly(task: OutputOnlyTask, shaderCode: string): Promise<void> {
    console.log('[WgpuTaskManager] Using OUTPUT_ONLY template');
    console.log('[WgpuTaskManager] Fragment shader:', shaderCode);
    await processOutputOnlyTemplate(task, shaderCode);
  }

  /**
   * Dispatch INPUT_AND_OUTPUT task to template handler.
   */
  private async _processInputAndOutput(task: InputAndOutputTask, shaderCode: string): Promise<void> {
    console.log('[WgpuTaskManager] Using INPUT_AND_OUTPUT template');
    console.log('[WgpuTaskManager] Fragment shader:', shaderCode);
    await processInputAndOutputTemplate(task, shaderCode);
  }
}




export { WgpuTaskManager };