---
name: warp-primitives
description: "CUDA warp-level primitives: shuffle, ballot, active masks, syncwarp, and when to replace shared memory with warp collectives."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,warp,warp-primitives,warp-collectives,warp-synchronous,shuffle,ballot,warp-vote,__shfl_sync,__ballot_sync,__activemask,__syncwarp,warp-reduction"
---

# CUDA Warp Primitives (C++)

Use this page for warp-scope communication patterns that avoid block-wide synchronization and often reduce shared-memory traffic.

## Core Warp Primitives

Common warp-level intrinsics include:

- `__shfl_sync`
- `__shfl_down_sync`
- `__shfl_xor_sync`
- `__ballot_sync`
- `__all_sync`
- `__any_sync`
- `__activemask`
- `__syncwarp`

These operate on the active lanes of a warp and require a consistent participation mask.

## When Warp Primitives Help

Use warp primitives when:

- communication stays within one warp
- you want to avoid shared memory for a small reduction or exchange
- a block-wide barrier would be too expensive or unnecessary

Typical cases:

- warp reductions
- prefix-like exchanges within a warp
- voting and mask construction
- lane permutation for register-resident data

## Shuffle vs Shared Memory

Shuffle intrinsics move register values directly between lanes.

Prefer shuffle when:

- the communication scope is one warp
- data volume is small
- you want to avoid shared-memory stores, loads, and `__syncthreads()`

Prefer shared memory when:

- communication crosses warp boundaries
- the data footprint exceeds what is comfortable in registers
- the access pattern spans the whole block

## Memory Ordering Rule

- `__syncwarp()` provides warp-scope synchronization and memory ordering for participating lanes
- vote intrinsics such as `__ballot_sync` do not by themselves imply a memory barrier

If lanes communicate through memory, insert `__syncwarp()`.

## Minimal Warp Reduction Pattern

```cpp
float x = value;
for (int offset = 16; offset > 0; offset >>= 1) {
  x += __shfl_down_sync(0xffffffff, x, offset);
}
```

This is the standard first step before reducing across warps with shared memory or atomics.

## Mask Discipline

For `_sync` intrinsics:

- every participating lane must use the same mask
- each calling lane must have its own bit set in the mask
- all named non-exited lanes must execute the same intrinsic with the same mask

Violating mask discipline leads to undefined behavior.

## Related Topics

- Execution model: `../execution-model/DOC.md`
- Block and warp synchronization: `../synchronization/DOC.md`
- Shared memory alternatives: `../shared-memory/DOC.md`
- Atomics and reductions: `../atomics-and-reductions/DOC.md`
- Tensor Core warp-level usage: `../tensor-cores/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Programming Guide, warp vote and match functions: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html
- CUDA C++ Programming Guide, shuffle functions: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html
- CUDA C++ Programming Guide, `__syncwarp()`: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html#synchronization-functions

Last cross-check date: 2026-03-20
