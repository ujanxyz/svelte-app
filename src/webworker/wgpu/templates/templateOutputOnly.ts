/**
 * Template handler for OUTPUT_ONLY tasks.
 * Generates pixels via shader with no input textures.
 */

import type { OutputOnlyTask } from '../types';
import {
  calculateBufferAlignment,
  createFullscreenTriangleVertexModule,
  createOutputBuffer,
  createRenderTargetTexture,
  initializeDevice,
  readbackBuffer,
} from '../wgpuCommon';

export async function processOutputOnlyTemplate(
  task: OutputOnlyTask,
  shaderCode: string
): Promise<void> {
  const { width, height, pixels } = task;

  console.log(`[templateOutputOnly] Processing ${width}x${height} output-only task`);

  // Initialize device
  const { device } = await initializeDevice();

  // Calculate buffer alignment
  const alignment = calculateBufferAlignment(width, 4);
  alignment.bufferSize = alignment.alignedBytesPerRow * height;

  console.log(
    `[templateOutputOnly] Alignment: unaligned=${alignment.unalignedBytesPerRow}, aligned=${alignment.alignedBytesPerRow}, bufferSize=${alignment.bufferSize}`
  );

  // Create resources
  const renderTarget = createRenderTargetTexture(device, width, height);
  const outputBuffer = createOutputBuffer(device, alignment.bufferSize);

  // Create pipeline
  const vertexModule = createFullscreenTriangleVertexModule(device);
  const fragmentModule = device.createShaderModule({ code: shaderCode });

  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: vertexModule,
      entryPoint: 'main',
    },
    fragment: {
      module: fragmentModule,
      entryPoint: 'main',
      targets: [{ format: 'rgba8unorm' }],
    },
    primitive: { topology: 'triangle-list' },
  });

  // Render and copy
  const encoder = device.createCommandEncoder();
  const pass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view: renderTarget.createView(),
        loadOp: 'clear',
        clearValue: { r: 0, g: 0, b: 0, a: 1 },
        storeOp: 'store',
      },
    ],
  });
  pass.setPipeline(pipeline);
  pass.draw(3);
  pass.end();

  encoder.copyTextureToBuffer(
    { texture: renderTarget },
    { buffer: outputBuffer, bytesPerRow: alignment.alignedBytesPerRow },
    [width, height]
  );

  device.queue.submit([encoder.finish()]);

  // Readback
  await readbackBuffer(device, outputBuffer, alignment, height, pixels);

  console.log('[templateOutputOnly] Task completed');
}
