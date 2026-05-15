/**
 * Template handler for INPUT_AND_OUTPUT tasks.
 * Reads one input texture, writes to output buffer.
 * Shader receives input texture and outputs pixels.
 */

import type { InputAndOutputTask } from '../types';

import {
  calculateBufferAlignment,
  createFullscreenTriangleVertexModule,
  createInputTexture,
  createOutputBuffer,
  createRenderTargetTexture,
  initializeDevice,
  readbackBuffer,
} from '../lib/wgpuCommon';

export async function processInputAndOutputTemplate(
  task: InputAndOutputTask,
  shaderCode: string
): Promise<void> {
  const { width, height, pixels, srcWidth, srcHeight, srcPixels } = task;

  console.log(
    `[templateInputAndOutput] Processing input(${srcWidth}x${srcHeight}) -> output(${width}x${height}) task`,
    task
  );

  // Initialize device
  const { device } = await initializeDevice();

  // Calculate buffer alignment for output
  const alignment = calculateBufferAlignment(width, 4);
  alignment.bufferSize = alignment.alignedBytesPerRow * height;

  console.log(
    `[templateInputAndOutput] Output alignment: unaligned=${alignment.unalignedBytesPerRow}, aligned=${alignment.alignedBytesPerRow}, bufferSize=${alignment.bufferSize}`
  );

  // Create resources
  const renderTarget = createRenderTargetTexture(device, width, height);
  const outputBuffer = createOutputBuffer(device, alignment.bufferSize);
  const inputTexture = createInputTexture(device, srcWidth, srcHeight, srcPixels);

  // Create bind group for input texture
  const sampler = device.createSampler({
    magFilter: 'linear',
    minFilter: 'linear',
  });

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT,
        texture: { sampleType: 'float' },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.FRAGMENT,
        sampler: { type: 'filtering' },
      },
    ],
  });

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      { binding: 0, resource: inputTexture.createView() },
      { binding: 1, resource: sampler },
    ],
  });

  // Create pipeline with bind group layout
  const vertexModule = createFullscreenTriangleVertexModule(device);
  const fragmentModule = device.createShaderModule({ code: shaderCode });

  const pipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [bindGroupLayout],
  });

  const pipeline = device.createRenderPipeline({
    layout: pipelineLayout,
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
  pass.setBindGroup(0, bindGroup);
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

  console.log('[templateInputAndOutput] Task completed');
}
