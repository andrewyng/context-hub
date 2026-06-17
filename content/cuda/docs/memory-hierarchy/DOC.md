---
name: memory-hierarchy
description: "CUDA memory hierarchy essentials: registers, local, shared, global, constant, and texture/read-only paths."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,memory-hierarchy,registers,local-memory,shared-memory,global-memory,constant-memory,texture-memory"
---

# CUDA Memory Hierarchy (C++)

Use this page to decide which CUDA memory space fits a kernel access pattern.

## The Main Spaces

- registers: fastest per-thread storage, but limited
- local memory: per-thread memory in device memory, commonly used for spills or large automatic objects
- shared memory: on-chip storage shared by threads in a block
- global memory: large device memory visible across kernels and blocks
- constant memory: cached read-only storage, especially effective when many threads read the same location
- texture/read-only path: cached read-only access path that can help some spatial access patterns

## Registers

Registers are the first-choice storage for hot per-thread values.

- lowest-latency storage for thread-private temporaries
- high register pressure can reduce occupancy
- if the compiler runs out of registers, values may spill to local memory

## Local Memory

Despite the name, local memory is not on-chip shared scratchpad memory.

- it is private to one thread
- it resides in device memory
- it often appears when large automatic arrays are used or when register pressure causes spills

If a kernel unexpectedly slows down, local-memory traffic is often a sign that register use is too high.

## Shared Memory

Shared memory is the standard block-level scratchpad.

- shared by threads in one block
- useful for data reuse, tiling, transpose, and reduction
- requires explicit synchronization when threads communicate through it
- performance depends on avoiding bank conflicts

See `../shared-memory/DOC.md` for the detailed usage rules.

## Global Memory

Global memory is the default large device memory space.

- visible to all threads and across kernel launches
- highest capacity among device spaces
- much slower than on-chip storage
- performance depends heavily on coalesced access patterns

See `../coalescing/DOC.md` for access-pattern guidance.

## Constant Memory

Constant memory is read-only from device code and is cached.

- best when many threads read the same address
- not a substitute for shared memory
- useful for broadcast-like parameters or small read-only tables

## Texture / Read-Only Path

Texture and read-only cached access paths can help when:

- access is read-only
- locality is irregular or spatial
- the pattern is not ideal for standard coalesced global loads

Do not default to texture memory for ordinary linear arrays; it is a pattern-specific tool.

## Selection Heuristics

- value reused only by one thread: registers first
- value reused by many threads in one block: shared memory
- large tensor or array visible across blocks: global memory
- small read-only broadcast table: constant memory
- read-only data with irregular spatial locality: texture/read-only path

## Practical Warnings

- local memory is usually a warning sign, not a target optimization space
- shared memory helps only when reuse or reordering outweighs its setup and sync cost
- high occupancy alone does not guarantee fast memory behavior
- coalescing and bank conflicts often matter more than raw memory-space choice

## Related Topics

- Shared memory details: `../shared-memory/DOC.md`
- Synchronization rules: `../synchronization/DOC.md`
- Coalesced access patterns: `../coalescing/DOC.md`
- Unified Memory: `../unified-memory/DOC.md`
- Pinned memory and transfers: `../pinned-memory-and-transfers/DOC.md`
- PTX state spaces: `../ptx/references/state-spaces-and-types.md`

## Official Source Links (Fact Check)

- CUDA C++ Programming Guide, programming model and memory overview: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html
- CUDA C++ Programming Guide, device memory space specifiers: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html#device-memory-space-specifiers
- CUDA C++ Programming Guide, local memory discussion: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html
- CUDA C++ Programming Guide, shared memory: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html#shared

Last cross-check date: 2026-03-20
