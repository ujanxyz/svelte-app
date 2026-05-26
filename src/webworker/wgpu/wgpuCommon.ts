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

export interface BufferAlignment {
  bytesPerPixel: number;
  unalignedBytesPerRow: number;
  alignedBytesPerRow: number;
  bufferSize: number;
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
 * Create a fullscreen quad vertex buffer for two triangles in triangle-strip order.
 * Vertex layout: vec2<f32> position at location(0).
 */
export function createFullscreenRectVertexBuffer(device: GPUDevice): GPUBuffer {
  const vertices = new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    1, 1,
  ]);

  const vertexBuffer = device.createBuffer({
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(vertexBuffer, 0, vertices);
  return vertexBuffer;
}

/**
 * Create vertex shader module for fullscreen-quad rendering.
 * Produces normalized UV in location(0) for fragment stage.
 */
export function createFullscreenTriangleVertexModule(device: GPUDevice): GPUShaderModule {
  return device.createShaderModule({
    code: 
`struct VSOut {
  @builtin(position) pos: vec4<f32>,
  @location(0) uv: vec2<f32>,
};
@vertex fn vs_main(@location(0) position: vec2<f32>) -> VSOut {
  var out: VSOut;
  out.pos = vec4<f32>(position, 0.0, 1.0);
  out.uv = (position * 0.5) + vec2<f32>(0.5);
  out.uv.y = 1.0 - out.uv.y;
  return out;
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
