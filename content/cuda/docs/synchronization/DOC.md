---
name: synchronization
description: "CUDA synchronization essentials: __syncthreads, __syncwarp, block-wide visibility, and common barrier rules."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,synchronization,syncthreads,syncwarp,block-barrier,barrier-divergence,__syncthreads__,__syncwarp,barrier,warp,thread-block,memory-ordering"
---

# CUDA Synchronization (C++)

Use this page for CUDA C++ synchronization rules at the thread-block and warp levels.

## Thread-Block Synchronization

`__syncthreads()` is the standard block-wide barrier.

- every non-exited thread in the block must reach it
- it waits until all threads in the block arrive
- global and shared memory accesses before the barrier become visible to threads in the block after the barrier

Use it when threads in a block communicate through memory.

Typical cases:

- one phase writes shared memory and a later phase reads it
- reduction loops between strides
- transpose, stencil, or tiled GEMM phases

## Conditional Barrier Rule

Do not place `__syncthreads()` in divergent control flow unless the condition is uniform across the entire block.

Unsafe pattern:

```cpp
if (threadIdx.x < 16) {
  __syncthreads();  // Wrong unless every thread takes the same branch
}
```

Safe pattern:

```cpp
bool active = threadIdx.x < 16;
if (active) {
  // work
}
__syncthreads();
```

## Variants of `__syncthreads()`

CUDA also provides block-wide variants that combine a barrier with a predicate reduction:

- `__syncthreads_count(predicate)`
- `__syncthreads_and(predicate)`
- `__syncthreads_or(predicate)`

Use them when you need a collective decision at block scope without adding a separate reduction pass.

## Warp-Level Synchronization

`__syncwarp(mask)` synchronizes participating lanes in a warp.

- every participating lane must use the same mask
- each calling lane must have its own bit set in the mask
- it provides memory ordering among participating threads

Use `__syncwarp()` when:

- threads communicate only within one warp
- you want a lighter-weight barrier than `__syncthreads()`
- you are using warp-specialized code paths

## Important Distinction: Warp Vote vs Barrier

Warp vote intrinsics such as:

- `__all_sync`
- `__any_sync`
- `__ballot_sync`

do not imply a memory barrier by themselves. Use `__syncwarp()` when lanes must safely communicate through memory.

## Common Mistakes

- assuming warp-synchronous execution without an explicit warp barrier
- using `__syncthreads()` in a branch that only some threads take
- reading shared memory written by other threads before a barrier
- using block-wide barriers when the communication scope is only one warp

## Rule of Thumb

- use `__syncthreads()` for cross-warp communication inside a block
- use `__syncwarp()` for intra-warp communication
- if the communication path uses shared memory, place the barrier between the producer and consumer phases

## Related Topics

- Shared memory usage: `../shared-memory/DOC.md`
- Memory space overview: `../memory-hierarchy/DOC.md`
- Coalesced global access: `../coalescing/DOC.md`
- Warp-level primitives: `../warp-primitives/DOC.md`
- Atomics and reductions: `../atomics-and-reductions/DOC.md`
- Cooperative Groups: `../cooperative-groups/DOC.md`
- Async copy: `../async-copy/DOC.md`
- Memory fences and ordering: `../memory-fences-and-ordering/DOC.md`
- PTX synchronization primitives: `../ptx/instructions/sync-comm/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Programming Guide, thread hierarchy and cooperation: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html
- CUDA C++ Programming Guide, synchronization functions: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html#synchronization-functions
- CUDA C++ Programming Guide, warp vote and match functions: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html

Last cross-check date: 2026-03-20
