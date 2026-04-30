---
name: metal-kernel-basics
description: "Apple Metal kernel basics: Metal Shading Language entry points, grid/threadgroup indexing, and compute-kernel structure."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,msl,metal-shading-language,compute,kernel,threadgroup,grid,simdgroup,thread-position-in-grid"
---

# Metal Kernel Basics

Use this page when you need the Metal Shading Language view of compute kernels: entry-point syntax, built-in indices, and the mapping between grid work and threadgroup work.

## What A Compute Kernel Looks Like

In Metal, a compute kernel is a `kernel` function written in Metal Shading Language (MSL).

- `kernel` marks a compute entry point
- parameters include buffers/textures plus built-in execution coordinates
- execution is organized over a grid of threads, grouped into threadgroups

## Minimal Kernel Shape

```cpp
#include <metal_stdlib>
using namespace metal;

kernel void add_arrays(device const float* a       [[buffer(0)]],
                       device const float* b       [[buffer(1)]],
                       device float* out           [[buffer(2)]],
                       uint gid                    [[thread_position_in_grid]]) {
  out[gid] = a[gid] + b[gid];
}
```

## Built-In Indices That Matter

The official Metal documentation and MSL specification expose built-ins that map work to threads:

- `thread_position_in_grid`: global linear or multidimensional position
- `thread_position_in_threadgroup`: local index inside one threadgroup
- `threadgroup_position_in_grid`: which threadgroup is executing
- `threads_per_threadgroup`: threadgroup shape selected by the host

Use global indices for final data addressing and local indices for threadgroup-shared staging patterns.

## Mental Model

For most data-parallel kernels:

1. Host code defines a grid size.
2. Host code chooses a threadgroup size.
3. Metal launches one kernel instance per thread in the grid.
4. Each thread derives the element or tile it owns from built-in indices.

This is conceptually close to CUDA block/thread indexing, but the naming and API boundaries are different.

## Practical Mapping Rules

- Treat `thread_position_in_grid` as the default index for elementwise kernels.
- Use `thread_position_in_threadgroup` only when coordinating through `threadgroup` memory.
- Keep threadgroup dimensions explicit when moving from 1D kernels to 2D or 3D image/tile kernels.
- Do not assume CUDA warp semantics; when subgroup behavior matters, use Metal SIMD-group concepts explicitly.

## Common Failure Modes

- Using local threadgroup indices as if they were global output indices.
- Choosing a threadgroup shape that does not match the kernel's indexing math.
- Porting CUDA code and assuming block/thread identifiers map one-to-one to Metal names.
- Forgetting bounds checks when the dispatched grid is rounded up past tensor or image extent.

## When To Escalate

Stay at this layer for:

- basic compute kernels
- elementwise operations
- tiled kernels with straightforward threadgroup staging

Jump to more specific docs when you need:

- threadgroup memory and barriers
- host-side pipeline creation and dispatch
- PyTorch `mps` integration or custom op wiring

## Official Source Links (Fact Check)

- Metal resources hub: https://developer.apple.com/metal/resources/
- Metal Shading Language Specification: https://developer.apple.com/metal/resources/
- Performing calculations on a GPU: https://developer.apple.com/documentation/metal/performing-calculations-on-a-gpu

Last cross-check date: 2026-03-21
