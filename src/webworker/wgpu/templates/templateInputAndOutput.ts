/**
 * Unified template handler for WebGPU tasks.
 * Supports 0..N input images and one target output image.
 */

import type { WgpuTask } from '../types';
import { WebGpuResources } from '../WebGpuResources';
import {
  calculateBufferAlignment,
  createFullscreenRectVertexBuffer,
  createFullscreenTriangleVertexModule,
  createInputTexture,
  createOutputBuffer,
  createRenderTargetTexture,
  readbackBuffer,
} from '../wgpuCommon';

export async function processInputAndOutputTemplate(
  task: WgpuTask,
  shaderCode: string
): Promise<void> {
  const { targetImage, inImages } = task;
  const { width, height, pixels } = targetImage;
  const inputCount = inImages.length;

  console.log(
    `[templateInputAndOutput] Processing ${inputCount} input image(s) -> output(${width}x${height}) task`,
    task
  );

  // Initialize shared device and static resources once.
  const webGpuResources = new WebGpuResources();
  const { device } = await webGpuResources.getResources();

  // Calculate buffer alignment for output
  const alignment = calculateBufferAlignment(width, 4);
  alignment.bufferSize = alignment.alignedBytesPerRow * height;

  console.log(
    `[templateInputAndOutput] Output alignment: unaligned=${alignment.unalignedBytesPerRow}, aligned=${alignment.alignedBytesPerRow}, bufferSize=${alignment.bufferSize}`
  );

  // Create resources
  const renderTarget = createRenderTargetTexture(device, width, height);
  const outputBuffer = createOutputBuffer(device, alignment.bufferSize);
  const vertexBuffer = createFullscreenRectVertexBuffer(device);

  let bindGroupLayout: GPUBindGroupLayout | undefined;
  let bindGroup: GPUBindGroup | undefined;

  if (inputCount > 0) {
    const inputTextures = inImages.map((img, index) => {
      const requiredBytes = img.width * img.height * 4;
      if (img.pixels.byteLength < requiredBytes) {
        throw new Error(
          `[templateInputAndOutput] inImages[${index}] pixels too small: required=${requiredBytes}, actual=${img.pixels.byteLength}`,
        );
      }
      return createInputTexture(device, img.width, img.height, img.pixels);
    });

    const sampler = device.createSampler({
      magFilter: 'linear',
      minFilter: 'linear',
    });

    // Dedicated bind group for input textures/sampler.
    // binding(0) is sampler, binding(1..N) are texture_2d resources.
    bindGroupLayout = device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          sampler: { type: 'filtering' },
        },
        ...inputTextures.map((_, index) => ({
          binding: index + 1,
          visibility: GPUShaderStage.FRAGMENT,
          texture: {
            sampleType: 'float' as GPUTextureSampleType,
            viewDimension: '2d' as GPUTextureViewDimension,
          },
        })),
      ],
    });

    bindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        { binding: 0, resource: sampler },
        ...inputTextures.map((texture, index) => ({
          binding: index + 1,
          resource: texture.createView({ dimension: '2d' }),
        })),
      ],
    });
  }

  // Create pipeline with bind group layout
  const vertexModule = createFullscreenTriangleVertexModule(device);
  const fragmentModule = device.createShaderModule({ code: shaderCode });

  const pipeline = device.createRenderPipeline({
    layout: bindGroupLayout
      ? device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] })
      : 'auto',
    vertex: {
      module: vertexModule,
      entryPoint: 'vs_main',
      buffers: [
        {
          arrayStride: 8,
          attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x2' }],
        },
      ],
    },
    fragment: {
      module: fragmentModule,
      entryPoint: 'fs_main',
      targets: [{ format: 'rgba8unorm' }],
    },
    primitive: { topology: 'triangle-strip' },
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
  pass.setVertexBuffer(0, vertexBuffer);
  if (bindGroup) {
    pass.setBindGroup(0, bindGroup);
  }
  pass.draw(4);
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
