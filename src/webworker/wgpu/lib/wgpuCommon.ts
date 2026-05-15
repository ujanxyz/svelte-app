/**
 * Common WebGPU utilities for device, buffer, and texture management.
 * Shared across all task templates.
 */

// Type declarations for WebGPU global constants
// These are defined in the WebGPU spec and available at runtime in browsers
declare global {
  const GPUTextureUsage: {
    readonly COPY_SRC: 0x01;
    readonly COPY_DST: 0x02;
    readonly TEXTURE_BINDING: 0x04;
    readonly STORAGE_BINDING: 0x08;
    readonly RENDER_ATTACHMENT: 0x10;
  };
  const GPUBufferUsage: {
    readonly MAP_READ: 0x0001;
    readonly MAP_WRITE: 0x0002;
    readonly COPY_SRC: 0x0004;
    readonly COPY_DST: 0x0008;
    readonly INDEX: 0x0010;
    readonly VERTEX: 0x0020;
    readonly UNIFORM: 0x0040;
    readonly STORAGE: 0x0080;
    readonly INDIRECT: 0x0100;
    readonly QUERY_RESOLVE: 0x0200;
  };
  const GPUMapMode: {
    readonly READ: 0x0001;
    readonly WRITE: 0x0002;
  };
  const GPUShaderStage: {
    readonly VERTEX: 0x1;
    readonly FRAGMENT: 0x2;
    readonly COMPUTE: 0x4;
  };
}

export interface DeviceContext {
  device: GPUDevice;
  adapter: GPUAdapter;
}

export interface BufferAlignment {
  bytesPerPixel: number;
  unalignedBytesPerRow: number;
  alignedBytesPerRow: number;
  bufferSize: number;
}

/**
 * Initialize WebGPU device and adapter.
 * Throws if WebGPU is not supported.
 */
export async function initializeDevice(): Promise<DeviceContext> {
  const adapter = await navigator.gpu?.requestAdapter();
  if (!adapter) {
    throw new Error('[wgpuCommon] WebGPU not supported or adapter unavailable');
  }

  const device = await adapter.requestDevice();
  if (!device) {
    throw new Error('[wgpuCommon] Failed to request WebGPU device');
  }

  return { device, adapter };
}

/**
 * Calculate buffer alignment for WebGPU texture readback.
 * WebGPU requires bytesPerRow to be a multiple of 256.
 */
export function calculateBufferAlignment(width: number, bytesPerPixel: number = 4): BufferAlignment {
  const unalignedBytesPerRow = width * bytesPerPixel;
  const alignedBytesPerRow = Math.ceil(unalignedBytesPerRow / 256) * 256;
  // Avoid overflow with bitwise OR
  const alignedRows = (alignedBytesPerRow | 0) as number;
  // Note: height will be applied by caller to compute total bufferSize
  return {
    bytesPerPixel,
    unalignedBytesPerRow,
    alignedBytesPerRow: alignedRows,
    bufferSize: 0, // Caller will set after knowing height
  };
}

/**
 * Create a render target texture (RGBA8, renderable).
 */
export function createRenderTargetTexture(
  device: GPUDevice,
  width: number,
  height: number
): GPUTexture {
  return device.createTexture({
    size: [width, height],
    format: 'rgba8unorm',
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
  });
}

/**
 * Create an input texture from pixel data (samplable, not renderable).
 */
export function createInputTexture(
  device: GPUDevice,
  width: number,
  height: number,
  pixelData: Uint8Array
): GPUTexture {
  const texture = device.createTexture({
    size: [width, height],
    format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  });

  device.queue.writeTexture(
    { texture },
    pixelData,
    { bytesPerRow: width * 4 },
    [width, height]
  );

  return texture;
}

/**
 * Create an output buffer for reading GPU results back to CPU.
 */
export function createOutputBuffer(device: GPUDevice, bufferSize: number): GPUBuffer {
  return device.createBuffer({
    size: bufferSize,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });
}

/**
 * Create a simple full-screen triangle render pass setup.
 * Returns the vertex shader module for a fullscreen triangle.
 */
export function createFullscreenTriangleVertexModule(device: GPUDevice): GPUShaderModule {
  return device.createShaderModule({
    code: `@vertex fn main(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
      var pos = array<vec2f, 3>(vec2(-1, -1), vec2(3, -1), vec2(-1, 3));
      return vec4f(pos[i], 0.0, 1.0);
    }`,
  });
}

/**
 * Create a basic render pipeline with the given fragment shader.
 * Assumes fullscreen triangle vertex shader and RGBA8 output.
 */
export function createRenderPipeline(
  device: GPUDevice,
  fragmentShaderCode: string,
  bindGroupLayout?: GPUBindGroupLayout
): GPURenderPipeline {
  const vertexModule = createFullscreenTriangleVertexModule(device);
  const fragmentModule = device.createShaderModule({
    code: fragmentShaderCode,
  });

  return device.createRenderPipeline({
    layout: bindGroupLayout ? device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }) : 'auto',
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
}

/**
 * Readback GPU buffer to CPU with alignment handling.
 * Handles stripping the 256-byte alignment padding if necessary.
 */
export async function readbackBuffer(
  device: GPUDevice,
  outputBuffer: GPUBuffer,
  alignment: BufferAlignment,
  height: number,
  destPixels: Uint8Array
): Promise<void> {
  await outputBuffer.mapAsync(GPUMapMode.READ);
  try {
    const mappedRange = outputBuffer.getMappedRange();
    const sourceData = new Uint8Array(mappedRange);
    const requiredDestBytes = alignment.unalignedBytesPerRow * height;

    if (destPixels.buffer.byteLength === 0) {
      throw new Error(
        `[readbackBuffer] Destination pixel buffer is detached (byteLength=0). This usually means the WASM memory view became invalid before GPU readback completed.`
      );
    }
    if (destPixels.byteLength < requiredDestBytes) {
      throw new Error(
        `[readbackBuffer] Destination pixel buffer too small. required=${requiredDestBytes}, actual=${destPixels.byteLength}`
      );
    }

    if (alignment.alignedBytesPerRow === alignment.unalignedBytesPerRow) {
      // Perfect alignment: direct copy (trim to exact destination size)
      destPixels.set(sourceData.subarray(0, requiredDestBytes));
    } else {
      // Handle padding: copy row by row to strip the 256-byte alignment gap
      for (let y = 0; y < height; y++) {
        const srcOffset = y * alignment.alignedBytesPerRow;
        const destOffset = y * alignment.unalignedBytesPerRow;
        const row = sourceData.subarray(srcOffset, srcOffset + alignment.unalignedBytesPerRow);
        destPixels.set(row, destOffset);
      }
    }
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `[readbackBuffer] Failed to copy GPU output to destination pixels. The destination TypedArray may be detached or out-of-bounds. ${error.message}`
      );
    }
    throw error;
  } finally {
    outputBuffer.unmap();
  }
}
