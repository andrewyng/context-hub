---
name: metal-memory-and-threadgroup
description: "Apple Metal memory and threadgroup basics: address spaces, threadgroup memory, synchronization, and local-cooperation rules."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,msl,threadgroup,threadgroup-memory,barrier,threadgroup-barrier,device-memory,constant-memory,simdgroup,synchronization"
---

# Metal Memory And Threadgroup Basics

Use this page when a Metal kernel needs local cooperation: shared staging, barriers, or explicit memory-space reasoning.

## MSL Address Spaces

Metal Shading Language distinguishes address spaces such as:

- `device`: GPU-accessible buffer memory
- `constant`: read-only constant data
- `threadgroup`: memory shared by threads in one threadgroup
- `thread`: per-thread storage

This separation matters for both correctness and performance.

## Threadgroup Memory

Use `threadgroup` memory when:

- threads in one threadgroup reuse the same tile
- you need to reorder accesses before writing final outputs
- local reductions or stencil neighborhoods would otherwise reread device memory excessively

Conceptually this is the closest Metal analogue to CUDA shared memory.

## Synchronization Rule

If one subset of threads writes `threadgroup` memory and another subset reads it later, insert an appropriate threadgroup barrier before the read phase.

Without that barrier:

- readers may observe incomplete writes
- results can depend on scheduling details
- bugs may disappear in small tests and reappear at scale

## Practical Pattern

```cpp
threadgroup float tile[256];

uint lid = tid_in_tg;
uint gid = tid_in_grid;

tile[lid] = in[gid];
threadgroup_barrier(mem_flags::mem_threadgroup);

out[gid] = tile[lid] * 2.0f;
```

## What Not To Assume

- Metal threadgroups are not CUDA thread blocks in naming only; validate every ported synchronization point.
- SIMD-group behavior is not a drop-in CUDA warp model.
- A barrier for threadgroup memory does not automatically substitute for all higher-level producer-consumer protocol design.

## Common Failure Modes

- Barrier omitted after threadgroup writes and before dependent reads.
- Kernel uses threadgroup-local indices but dispatch size no longer matches the threadgroup allocation.
- Threadgroup allocation is too large for the chosen dispatch geometry or resource budget.
- CUDA-style warp assumptions are reused without checking Metal SIMD-group semantics.

## When To Stay High-Level

Stay in higher-level frameworks when:

- you only need standard tensor operators
- the framework already fuses or schedules the operation adequately
- custom kernel ownership is not worth the debugging surface

Drop to custom Metal kernels when:

- memory movement dominates and local staging is necessary
- you need a custom fused operation
- framework coverage or performance is insufficient

## Official Source Links (Fact Check)

- Metal resources hub: https://developer.apple.com/metal/resources/
- Metal Shading Language Specification: https://developer.apple.com/metal/resources/
- Compute passes: https://developer.apple.com/documentation/metal/compute-passes

Last cross-check date: 2026-03-21
