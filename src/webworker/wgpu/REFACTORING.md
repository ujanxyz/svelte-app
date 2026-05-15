# WebGPU Task Manager Refactoring Summary

## Overview

Refactored `wgpuTaskManager.ts` into a multi-template architecture to handle various WebGPU task types (output-only, input-and-output, etc.) with clean separation of concerns.

## Architecture

### File Structure

```
src/webworker/wgpu/
├── wgpuTaskManager.ts          # Main orchestrator (refactored)
├── types.ts                     # Task type definitions (extended)
├── lib/
│   └── wgpuCommon.ts           # Shared WebGPU utilities (NEW)
└── templates/
    ├── templateOutputOnly.ts    # Handler for output-only tasks (NEW)
    └── templateInputAndOutput.ts # Handler for input+output tasks (NEW)
```

## Key Changes

### 1. Extended Type System (`types.ts`)

- **Added `WgpuTaskType` enum** with:
  - `OUTPUT_ONLY`: Generates pixels via shader with no input textures
  - `INPUT_AND_OUTPUT`: Reads one input texture, writes to output buffer
  - `// TODO:` placeholders for future types (TWO_INPUTS, UNIFORM_AND_OUTPUT, etc.)

- **Created task interfaces**:
  - `BaseWgpuTask`: Common base with `type` and optional `shaderCode`
  - `OutputOnlyTask`: Legacy pattern with `width`, `height`, `pixels`
  - `InputAndOutputTask`: New pattern with `srcWidth`, `srcHeight`, `srcPixels` for input, `pixels` for output
  - `WgpuTask`: Union type for all templates

- **Maintained backward compatibility** with `PixelTask` interface

### 2. Common Utilities Library (`lib/wgpuCommon.ts`)

Extracted shared WebGPU operations to reduce duplication:

**Device Management:**

- `initializeDevice()`: Initialize adapter and device

**Buffer & Alignment:**

- `calculateBufferAlignment()`: Handle 256-byte alignment requirements
- `createOutputBuffer()`: Create GPU → CPU transfer buffer
- `createInputTexture()`: Create samplable input texture from pixel data
- `createRenderTargetTexture()`: Create renderable output texture

**Pipeline Support:**

- `createFullscreenTriangleVertexModule()`: Standard fullscreen triangle vertex shader
- `createRenderPipeline()`: Build render pipeline with optional bind group layout
- `readbackBuffer()`: Handle GPU → CPU readback with alignment padding

**Global WebGPU Constants:**

- Declared `GPUTextureUsage`, `GPUBufferUsage`, `GPUMapMode`, `GPUShaderStage` for TypeScript

### 3. Template Handlers

#### `templateOutputOnly.ts`

Processes output-only tasks (current behavior):

- Renders using fragment shader with no input textures
- Clears render target and draws fullscreen triangle
- Copies render target to output buffer
- Readback result into `task.pixels`

#### `templateInputAndOutput.ts`

Processes input-and-output tasks (new capability):

- Creates input texture from `srcPixels`
- Creates bind group with input texture + sampler
- Renders fragment shader accessing input texture
- Copies result to output buffer
- Readback result into `task.pixels`

### 4. Refactored Manager (`wgpuTaskManager.ts`)

**Main orchestrator responsibilities:**

1. **Task Type Inference** (`_inferAndRouteTask`):
   - Explicit type field takes precedence
   - Falls back to auto-detect based on field presence:
     - If `srcPixels`, `srcWidth`, `srcHeight` present → `INPUT_AND_OUTPUT`
     - If `pixels` present → `OUTPUT_ONLY`

2. **Routing & Dispatch**:
   - Routes to appropriate template handler
   - Handles shader code fallback to defaults
   - Type-safe error handling

3. **Default Shaders**:
   - `OUTPUT_ONLY`: Grid pattern with tile colors (original debug shader)
   - `INPUT_AND_OUTPUT`: Passthrough with subtle desaturation

## Usage Patterns

### Output-Only Task (Legacy)

```typescript
{
  type: WgpuTaskType.OUTPUT_ONLY,
  width: 1024,
  height: 768,
  pixels: Uint8Array,
  shaderCode: "..." // optional
}
```

### Input-and-Output Task (New)

```typescript
{
  type: WgpuTaskType.INPUT_AND_OUTPUT,
  width: 512,
  height: 512,
  pixels: Uint8Array,           // output
  srcWidth: 1024,
  srcHeight: 768,
  srcPixels: Uint8Array,        // input
  shaderCode: "..."              // optional
}
```

### Auto-Detection (Type Field Optional)

```typescript
// Auto-detected as OUTPUT_ONLY
{ width: 512, height: 512, pixels: Uint8Array }

// Auto-detected as INPUT_AND_OUTPUT
{ width: 512, height: 512, pixels: Uint8Array,
  srcWidth: 256, srcHeight: 256, srcPixels: Uint8Array }
```

## Future Extensions (TODOs)

Easy to add new task templates by:

1. Define new interface extending `BaseWgpuTask` in `types.ts`
2. Add enum value to `WgpuTaskType`
3. Create handler in `templates/templateNewType.ts`
4. Add case in `_inferAndRouteTask()` switch or detection logic
5. Optional: Add default shader in `_getDefaultShaderForType()`

**Planned expansions:**

- `TWO_INPUTS`: Read two input textures
- `UNIFORM_AND_OUTPUT`: Bind uniform buffer data
- `MULTI_INPUT_OUTPUT`: Flexible input/output configuration

## Error Handling

- Logs all task lifecycle events
- Throws descriptive errors for:
  - Unsupported task types
  - WebGPU unavailability
  - Type inference failures
- Graceful fallback to default shaders

## Benefits

- **Modularity**: Each template isolated in its own file
- **Maintainability**: Common code centralized in lib
- **Extensibility**: New task types require minimal changes
- **Type Safety**: Full TypeScript coverage with discriminated unions
- **Backward Compatible**: Existing OUTPUT_ONLY code works unchanged
- **Clean Layout**: Organized folder structure for future growth
