---
name: atomics-and-reductions
description: "CUDA atomics and reduction essentials: atomicAdd, shared/global scope, warp-first reduction, and common tradeoffs."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,atomics,reduction,atomicAdd,atomicCAS,shared-memory,warp-reduction"
---

# CUDA Atomics And Reductions (C++)

Use this page when deciding between direct atomics, shared-memory reductions, and warp-first reduction patterns.

## Atomic Basics

An atomic operation performs a read-modify-write sequence as one atomic transaction on a word in global or shared memory.

Common examples:

- `atomicAdd`
- `atomicCAS`
- `atomicMax`
- `atomicMin`

Atomics are correct tools for contention-sensitive updates, but they can serialize hot spots.

## Scope Choice

- shared-memory atomics are useful for contention within one block
- global-memory atomics are visible across blocks but usually cost more under heavy contention

A common pattern is:

1. reduce within a warp
2. reduce within a block using shared memory
3. emit one global atomic per block

## Preferred Reduction Structure

For many reductions, do not start with one atomic per thread.

Better default:

- first use warp shuffle reduction
- then combine warp results in shared memory
- then write one value per block or one atomic per block

This reduces contention and memory traffic.

## When Direct Atomics Are Fine

Direct global atomics are often acceptable when:

- the output has low contention
- the kernel is not dominated by the atomic path
- simplicity matters more than peak throughput

Examples:

- histogram with many bins and good distribution
- sparse accumulation with low collision probability

## When Atomics Become A Problem

Expect trouble when:

- many threads update the same location
- the output space is very small
- the kernel becomes serialization-bound

In those cases, switch to hierarchical reduction or privatization.

## Minimal Strategy Guide

- one scalar result per block: block reduction in shared memory
- one scalar result for the whole grid: block reduction plus final stage
- many bins with moderate collisions: shared-memory privatization, then flush
- warp-local aggregation: use shuffle before touching shared or global memory

## Related Topics

- Shared memory staging: `../shared-memory/DOC.md`
- Warp-level collectives: `../warp-primitives/DOC.md`
- Synchronization rules: `../synchronization/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Programming Guide, atomic functions: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html
- CUDA C++ Best Practices Guide, reduction and shared-memory patterns: https://docs.nvidia.com/cuda/archive/13.0.0/cuda-c-best-practices-guide/index.html

Last cross-check date: 2026-03-20
