---
name: coalescing
description: "CUDA global-memory coalescing essentials: contiguous access, pitch, striding, and when shared memory helps."
metadata:
  languages: "cpp"
  versions: "13.0"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,coalescing,memory-coalescing,coalesced-access,uncoalesced-access,global-memory,memory-bandwidth,stride,pitch,shared-memory,transpose"
---

# CUDA Memory Coalescing (C++)

Use this page for global-memory access-pattern rules that determine whether a kernel uses bandwidth efficiently.

## What Coalescing Means

Coalescing is the hardware combining a warp's global-memory accesses into as few memory transactions as possible.

At a high level:

- adjacent threads should usually access adjacent addresses
- strided or scattered access wastes bandwidth
- good coalescing matters most in memory-bound kernels

## Best Default Pattern

For a 1D array, prefer:

```cpp
int i = blockIdx.x * blockDim.x + threadIdx.x;
value = input[i];
```

This maps neighboring threads to neighboring elements.

## Common Bad Pattern

Patterns like this often destroy coalescing:

```cpp
int i = blockIdx.x * blockDim.x + threadIdx.x;
value = input[i * stride];
```

Large stride across a warp usually turns one efficient transaction pattern into many inefficient ones.

## 2D Arrays and Pitch

For 2D row-major arrays, accesses are most efficient when:

- threads move along the row dimension together
- row width is aligned well for warp-based access

If width is not naturally aligned for the hardware, use pitched allocation:

- `cudaMallocPitch`
- `cudaMemcpy2D`

This is the standard fix when row width is awkward and rows need padding.

## Shared Memory As A Reordering Tool

Shared memory is often used together with coalescing:

- load from global memory in a coalesced pattern
- reorder in shared memory
- consume in the algorithm's preferred order

This is a common pattern for:

- transpose
- tiled GEMM
- stencil halos
- gather/scatter restructuring

## Coalescing vs Bank Conflicts

These are different problems:

- coalescing concerns global-memory transactions
- bank conflicts concern shared-memory accesses

A kernel can have good coalescing and bad shared-memory banking, or the reverse.

## Practical Heuristics

- if a warp reads a row of contiguous elements, that is usually good
- if a warp reads a column from a row-major array directly, that is usually bad
- if a transpose-like pattern is needed, use shared memory to convert the access pattern
- align vectorized loads when using `float2` / `float4`

## Minimal Tiling Pattern

```cpp
__shared__ float tile[32][33];

int x = blockIdx.x * 32 + threadIdx.x;
int y = blockIdx.y * 32 + threadIdx.y;

tile[threadIdx.y][threadIdx.x] = input[y * width + x];
__syncthreads();
```

This style is common because:

- the global load can be coalesced
- the padded shared tile helps avoid bank conflicts during transposed access

## When To Suspect Coalescing Problems

- bandwidth is far below expectation
- profiling shows many global-memory transactions per requested byte
- a transpose or gather/scatter kernel is unexpectedly slow
- changing block shape changes performance dramatically

## Related Topics

- Shared memory usage: `../shared-memory/DOC.md`
- Synchronization rules: `../synchronization/DOC.md`
- Memory-space selection: `../memory-hierarchy/DOC.md`
- Runtime API overview: `../runtime/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Best Practices Guide, optimizing memory access: https://docs.nvidia.com/cuda/archive/13.0.0/cuda-c-best-practices-guide/index.html
- CUDA C++ Best Practices Guide, coalesced access to global memory: https://docs.nvidia.com/cuda/archive/13.0.0/cuda-c-best-practices-guide/index.html#coalesced-access-to-global-memory
- CUDA C++ Best Practices Guide, shared memory and matrix multiplication examples: https://docs.nvidia.com/cuda/archive/13.0.0/cuda-c-best-practices-guide/index.html#shared-memory
- CUDA C++ Programming Guide, 2D arrays and pitched allocation: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html

Last cross-check date: 2026-03-20
