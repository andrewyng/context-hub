---
name: metal-compute-launch-patterns
description: "Apple Metal compute launch patterns: MTLDevice, pipeline creation, buffers, encoders, and dispatch sizing."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,compute,mtldevice,mtlcommandqueue,mtlcommandbuffer,mtlcomputecommandencoder,dispatchthreads,threadsperthreadgroup,metallib"
---

# Metal Compute Launch Patterns

Use this page for the host-side structure of launching Metal compute work: device discovery, pipeline creation, resource binding, and dispatch.

## Core Host Objects

The standard compute path is built around:

- `MTLDevice`: the GPU device handle
- `MTLCommandQueue`: source of command buffers
- `MTLCommandBuffer`: unit of submitted GPU work
- `MTLComputePipelineState`: compiled compute kernel state
- `MTLComputeCommandEncoder`: binds resources and dispatches a compute kernel

## Minimal Host Flow

1. Get a `MTLDevice`.
2. Create or load a library containing the kernel function.
3. Build a `MTLComputePipelineState` from the kernel.
4. Allocate buffers/textures.
5. Create a command buffer and compute encoder.
6. Bind resources with `setBuffer`, `setTexture`, and related APIs.
7. Dispatch threads or threadgroups.
8. End encoding, commit the command buffer, and wait only when the CPU truly needs completion.

## Dispatch Sizing Rule

There are two separate choices:

- total work size: how many threads should run overall
- threadgroup size: how many threads cooperate locally

The host must choose both consistently with the kernel's indexing logic and any threadgroup-memory usage.

## Practical Example Shape

```cpp
id<MTLCommandBuffer> cb = [queue commandBuffer];
id<MTLComputeCommandEncoder> enc = [cb computeCommandEncoder];

[enc setComputePipelineState:pso];
[enc setBuffer:inBuffer offset:0 atIndex:0];
[enc setBuffer:outBuffer offset:0 atIndex:1];

MTLSize grid = MTLSizeMake(n, 1, 1);
MTLSize tpg  = MTLSizeMake(256, 1, 1);
[enc dispatchThreads:grid threadsPerThreadgroup:tpg];

[enc endEncoding];
[cb commit];
```

## Buffer And Binding Discipline

- buffer index values must match kernel `[[buffer(i)]]` attributes
- host-side buffer sizes must cover the kernel's full access range
- threadgroup memory declarations require matching dispatch assumptions
- command-buffer completion only guarantees GPU completion for that buffer, not correctness of your indexing logic

## Common Failure Modes

- Binding order does not match kernel buffer indices.
- Dispatch shape changes but kernel index math is left unchanged.
- Threadgroup size exceeds hardware or pipeline limits.
- CPU waits on every command buffer and destroys overlap unnecessarily.
- Library and pipeline creation are done inside a hot loop instead of being cached

## Profiling And Debugging Guidance

- Use Xcode Metal debugging tools to inspect resource bindings and dispatch layout.
- Use runtime validation to catch invalid API usage early.
- Treat incorrect output and poor throughput separately: one is often indexing or binding, the other is often sizing or memory behavior.

## Official Source Links (Fact Check)

- Performing calculations on a GPU: https://developer.apple.com/documentation/metal/performing-calculations-on-a-gpu
- Compute passes: https://developer.apple.com/documentation/metal/compute-passes
- Metal Programming Guide (archive): https://developer.apple.com/library/archive/documentation/Miscellaneous/Conceptual/MetalProgrammingGuide/Compute-Ctx/Compute-Ctx.html
- Metal developer tools: https://developer.apple.com/metal/tools/

Last cross-check date: 2026-03-21
