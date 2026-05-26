import type { AwaitTaskProcessor } from "@/webworker/await-task/types";

import { RunWgpuPipeline } from "./RunWgpuPipeline";
import type { WgpuTask } from "./types";
import { WebGpuResources } from "./WebGpuResources";

interface WgpuResult {

};

class WebGpuAwaitProcessor implements AwaitTaskProcessor<WgpuTask, WgpuResult> {
  public readonly name = "wgpu";
  private readonly webGpuResources = new WebGpuResources();

  async processAsync(taskId: string, taskData: WgpuTask): Promise<WgpuResult> {
    console.time("wgpu-fulfill");
    console.log(`[WebGpuAwaitProcessor] Processing task ${taskId} with data:`, taskData);
    let result: WgpuResult = {};
    try {
      await this._validateTask(taskData);
      const fragShader = taskData.fragShader || this._getDefaultFragmentShader();
      await RunWgpuPipeline(taskData, fragShader, this.webGpuResources);
    } catch (error) {
      console.error(`[WebGpuAwaitProcessor] Error fulfilling task ${taskId}:`, error);
    }
    console.timeEnd("wgpu-fulfill");
    return result;
  }

  private async _validateTask(task: WgpuTask): Promise<void> {
    if (!task.targetImage) {
      throw new Error("[WebGpuAwaitProcessor] Missing required field: targetImage");
    }
    if (!Array.isArray(task.inImages)) {
      throw new Error("[WebGpuAwaitProcessor] Missing required field: inImages[]");
    }
    if (!(task.targetImage.pixels instanceof Uint8Array)) {
      throw new Error("[WebGpuAwaitProcessor] targetImage.pixels must be Uint8Array");
    }
    if (task.targetImage.width <= 0 || task.targetImage.height <= 0) {
      throw new Error("[WebGpuAwaitProcessor] targetImage width/height must be > 0");
    }
    for (let i = 0; i < task.inImages.length; i++) {
      const img = task.inImages[i];
      if (!(img.pixels instanceof Uint8Array)) {
        throw new Error(`[WebGpuAwaitProcessor] inImages[${i}].pixels must be Uint8Array`);
      }
      if (img.width <= 0 || img.height <= 0) {
        throw new Error(`[WebGpuAwaitProcessor] inImages[${i}] width/height must be > 0`);
      }
    }
  }

  /**
   * Default fragment shader: left 50% black, right 50% white.
   * Used when fragShader is not provided in the task.
   */
  private _getDefaultFragmentShader(): string {
    return `struct VSOut {
  @builtin(position) pos: vec4<f32>,
  @location(0) uv: vec2<f32>,
};

@fragment
fn fs_main(in: VSOut) -> @location(0) vec4f {
  let uv = in.uv;
  if (uv.x < 0.5) {
    return vec4f(0.0, 0.0, 0.0, 1.0);
  } else {
    return vec4f(1.0, 1.0, 1.0, 1.0);
  }
}`;
  }
}

export { WebGpuAwaitProcessor };