# WebGPU Task Processor

Create a class `WebGpuResources.ts` which holds sharable resources across webgpu pipelines.
Place it in `WebGpuAwaitProcessor`.

- The `device`
- The texture sampler.
- A vertex buffer representing the triangle-strip for full quad (use current values). Give it a good representative name.

Wrap these in a message. Access via a reusable promise. The promise object is saved, internally it calls the async getter for GPU, on subsequent calls it should return instantly as it's already resolved.
