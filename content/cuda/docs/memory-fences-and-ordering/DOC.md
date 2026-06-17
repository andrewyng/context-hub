---
name: memory-fences-and-ordering
description: "CUDA memory-ordering essentials: weak ordering, __threadfence* scopes, visibility vs ordering, and fence-based handoff patterns."
metadata:
  languages: "cpp"
  versions: "12.6"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,memory-ordering,memory-fence,__threadfence,__threadfence_block,__threadfence_system,visibility,volatile"
---

# CUDA Memory Fences And Ordering (C++)

Use this page when kernels communicate through memory and correctness depends on ordering rather than just synchronization.

## Weak Ordering

CUDA uses a weakly ordered memory model.

- two unsynchronized threads reading and writing the same location create a data race
- memory fences enforce ordering of a thread's memory operations
- fences do not automatically provide block-wide participation like `__syncthreads()`

## Fence Scope Variants

CUDA provides three common fence scopes:

- `__threadfence_block()`
- `__threadfence()`
- `__threadfence_system()`

Roughly:

- block scope: ordering relevant to the calling block
- device scope: ordering relevant across the device
- system scope: ordering visible to host threads and peer devices as well

## Ordering vs Visibility

This distinction matters:

- fences order memory operations by the calling thread
- barriers coordinate participating threads
- visibility to observers may still require the right memory access path and synchronization pattern

In other words, a fence is not a replacement for `__syncthreads()`.

## Typical Pattern

Producer-consumer handoff across blocks often looks like:

1. producer writes data
2. producer executes `__threadfence()`
3. producer updates a flag or counter atomically
4. consumer observes the flag and then reads the data

Without the fence, the flag can become visible before the data it is meant to publish.

## Choosing The Scope

- same block only: usually `__threadfence_block()` or a block barrier pattern
- different blocks on the same device: typically `__threadfence()`
- host or peer-device observers: `__threadfence_system()`

Choose the narrowest scope that matches the communication pattern.

## Common Mistakes

- assuming atomics alone solve all ordering problems
- using `__threadfence()` when a block-local barrier is the real need
- forgetting that fences do not synchronize other threads
- using device-wide or system-wide fences more broadly than necessary

## Related Topics

- Synchronization rules: `../synchronization/DOC.md`
- Atomics and reductions: `../atomics-and-reductions/DOC.md`
- Streams and events: `../streams-and-events/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Programming Guide, memory fence functions: https://docs.nvidia.com/cuda/archive/12.6.1/cuda-c-programming-guide/index.html
- CUDA C++ Programming Guide, historical fence examples and ordering discussion: https://docs.nvidia.com/cuda/archive/11.5.0/cuda-c-programming-guide/index.html

Last cross-check date: 2026-03-20
