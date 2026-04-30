---
name: collective-communication-patterns
description: "CUDA collective communication essentials: reductions, scans, histogram-like updates, and hierarchical aggregation patterns."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,collective,reduction,scan,histogram,aggregation,warp-collective,block-collective"
---

# CUDA Collective Communication Patterns (C++)

Use this page for patterns where many threads combine, distribute, or summarize values.

## Common Collective Types

- reduction (sum/max/min/etc.)
- scan/prefix sum
- histogram and bucketized accumulation
- vote/ballot-based filtering

## Hierarchical Strategy

A standard high-performance pattern is hierarchical:

1. intra-warp collective (shuffle/vote)
2. intra-block collective (shared memory)
3. cross-block aggregation (global memory or multi-stage kernel)

This minimizes global contention.

## Reduction Pattern

- reduce in warp first with `__shfl*_sync`
- write one value per warp to shared memory
- final block reduction
- optionally one global write/atomic per block

## Scan Pattern

- use block-local scan primitives
- stitch block boundaries in a second phase when global prefix is required

Avoid forcing a single global synchronization model in one monolithic kernel.

## Histogram-Like Pattern

- privatize bins per warp/block when feasible
- merge privately accumulated bins later

Direct global atomics on a small bin set are usually the worst-case path.

## Related Topics

- Warp primitives: `../warp-primitives/DOC.md`
- Atomics and reductions: `../atomics-and-reductions/DOC.md`
- Synchronization: `../synchronization/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Programming Guide, warp intrinsics and synchronization primitives: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html
- CUDA C++ Best Practices Guide, reduction and memory optimization context: https://docs.nvidia.com/cuda/archive/13.0.0/cuda-c-best-practices-guide/index.html

Last cross-check date: 2026-03-20
