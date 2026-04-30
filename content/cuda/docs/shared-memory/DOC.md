---
name: shared-memory
description: "CUDA shared memory essentials: __shared__, dynamic shared memory, synchronization, bank conflicts, and async copy."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,shared-memory,sharedmem,smem,__shared__,dynamic-shared-memory,__syncthreads__,bank-conflict,bank-conflicts,bank-conflict-avoidance,padding,shared-memory-tiling,cp.async,mbarrier"
---

# CUDA Shared Memory (C++)

Use this page when you need the CUDA C++ view of shared memory: what `__shared__` means, how dynamic shared memory is declared, when `__syncthreads()` is required, and how bank conflicts affect performance.

## What Shared Memory Is

In the CUDA C++ Programming Guide, `__shared__` declares storage that:

- resides in the shared memory space of a thread block
- has the lifetime of the block
- has a distinct object per block
- is accessible only to threads in the same block

This makes shared memory the standard scratchpad for cooperation within a block.

## Static Shared Memory

Use a compile-time-sized declaration when the storage size is fixed:

```cpp
__global__ void saxpy_tile(const float* x, const float* y, float* out, int n) {
  __shared__ float tile[256];

  int tid = threadIdx.x;
  int i = blockIdx.x * blockDim.x + tid;

  if (i < n) {
    tile[tid] = x[i];
  }
  __syncthreads();

  if (i < n) {
    out[i] = 2.0f * tile[tid] + y[i];
  }
}
```

Use this form when the tile shape is fixed and simple.

## Dynamic Shared Memory

Use `extern __shared__` when the size is determined at launch time:

```cpp
__global__ void reduce_kernel(const float* input, float* output, int n) {
  extern __shared__ float smem[];

  int tid = threadIdx.x;
  int i = blockIdx.x * blockDim.x + tid;

  smem[tid] = (i < n) ? input[i] : 0.0f;
  __syncthreads();

  for (int stride = blockDim.x / 2; stride > 0; stride >>= 1) {
    if (tid < stride) smem[tid] += smem[tid + stride];
    __syncthreads();
  }

  if (tid == 0) output[blockIdx.x] = smem[0];
}

// Launch with dynamic shared memory bytes:
// reduce_kernel<<<blocks, threads, threads * sizeof(float)>>>(...);
```

The CUDA C++ Programming Guide notes that all `extern __shared__` variables start at the same address, so if you pack multiple arrays into dynamic shared memory you must manage offsets and alignment explicitly.

## Synchronization Rule

Use `__syncthreads()` when one set of threads writes shared memory and another set of threads in the same block will read it later.

- `__syncthreads()` is a block-wide barrier
- writes to shared memory before the barrier are visible to threads in the block after the barrier
- do not place it in divergent control flow unless the condition is uniform across the whole block

Typical cases:

- loading a tile from global memory into shared memory
- reduction steps between iterations
- transpose or stencil phases where threads consume values written by other threads

## Why Shared Memory Helps

The Best Practices Guide highlights three common reasons to use shared memory:

- avoid redundant loads from global memory
- transform global accesses into coalesced accesses
- avoid wasted bandwidth from strided patterns

Shared memory is especially useful for tiled GEMM, stencil, convolution, reduction, and transpose kernels.

## Bank Conflicts

Shared memory performance depends on bank usage.

- modern devices expose 32 banks for warp accesses
- successive 32-bit words map to successive banks
- if threads in a warp hit distinct banks, accesses can proceed concurrently
- if multiple threads hit the same bank, the access is split and serialized
- one important exception is broadcast: when threads read the same shared location, hardware can serve that efficiently

The standard remedy for column-wise access on a 32x32 tile is padding:

```cpp
__shared__ float tile[32][33];
```

The Best Practices Guide uses this pattern to remove many-way bank conflicts in a transpose-like matrix multiply example.

## Async Copy Path

For newer CUDA toolchains and architectures, shared memory can also participate in explicit async copy pipelines from global memory.

- C++ layer: `__pipeline_memcpy_async`, `__pipeline_commit`, `__pipeline_wait_prior`
- PTX layer: `cp.async`, `cp.async.commit_group`, `cp.async.wait_group`, and mbarrier-based completion

Use this path when you need to overlap global-to-shared transfers with computation and reduce intermediate register traffic.

## When To Escalate To PTX Docs

Stay in CUDA C++ docs for:

- `__shared__`
- dynamic shared memory launch configuration
- `__syncthreads()`
- bank conflict basics

Jump to PTX docs for:

- `.shared` state-space rules
- `cp.async`
- `mbarrier`
- TMA and shared-memory layout/swizzling

See:

- `../ptx/references/state-spaces-and-types.md`
- `../ptx/instructions/data-movement/references/cp-async.md`
- `../ptx/instructions/sync-comm/DOC.md`
- `../ptx/instructions/tma/DOC.md`

## Related Topics

- CUDA Runtime overview: `../runtime/DOC.md`
- Synchronization rules: `../synchronization/DOC.md`
- Memory-space overview: `../memory-hierarchy/DOC.md`
- Global-memory coalescing: `../coalescing/DOC.md`
- Warp-level primitives: `../warp-primitives/DOC.md`
- Tensor Core usage: `../tensor-cores/DOC.md`
- Async copy: `../async-copy/DOC.md`
- Thread Block Clusters / DSM: `../thread-block-clusters/DOC.md`
- PTX ISA overview: `../ptx/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Programming Guide, `__shared__`: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html#shared
- CUDA C++ Programming Guide, synchronization functions: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html#synchronization-functions
- CUDA C++ Best Practices Guide, Shared Memory: https://docs.nvidia.com/cuda/archive/13.0.0/cuda-c-best-practices-guide/index.html#shared-memory
- CUDA C++ Best Practices Guide, Shared Memory and Memory Banks: https://docs.nvidia.com/cuda/archive/13.0.0/cuda-c-best-practices-guide/index.html#shared-memory-and-memory-banks
- CUDA C++ Best Practices Guide, Async Copy from Global Memory to Shared Memory: https://docs.nvidia.com/cuda/archive/13.0.0/cuda-c-best-practices-guide/index.html#asynchronous-copy-from-global-memory-to-shared-memory

Last cross-check date: 2026-03-20
