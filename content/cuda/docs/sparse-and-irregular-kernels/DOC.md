---
name: sparse-and-irregular-kernels
description: "CUDA sparse/irregular kernel essentials: load imbalance, indirect access, divergence control, and locality-aware data layouts."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,sparse,irregular,load-balance,divergence,indirect-access,gather,scatter"
---

# CUDA Sparse And Irregular Kernels (C++)

Use this page when access patterns are indirect, data-dependent, or highly skewed.

## Why These Kernels Are Hard

Sparse/irregular workloads often suffer from:

- poor coalescing from indirect addressing
- warp divergence from data-dependent control flow
- load imbalance across warps/blocks
- cache inefficiency from weak locality

## Design Priorities

1. reduce divergence where possible.
2. improve memory locality through data reordering.
3. balance work granularity to avoid long-tail warps.
4. isolate hot irregular regions from regular compute regions.

## Common Patterns

- work queues for dynamic tasks
- segmented processing for variable-length rows/lists
- gather/scatter with index compression/reordering
- two-phase pipelines: count/scan then compact/execute

## Practical Techniques

- reorder indices to improve spatial locality
- use warp-level primitives for local compaction and voting
- split heavy/light workloads into separate kernels
- avoid over-synchronizing global progress paths

## Typical Pitfalls

- one-thread-per-item mapping with heavy skew
- atomics on hot addresses without privatization
- excessive branch nesting in the main kernel body

## Related Topics

- Coalescing: `../coalescing/DOC.md`
- Warp primitives: `../warp-primitives/DOC.md`
- Atomics and reductions: `../atomics-and-reductions/DOC.md`
- Fused kernel patterns: `../fused-kernel-design-patterns/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Best Practices Guide, memory behavior and control divergence context: https://docs.nvidia.com/cuda/archive/13.0.0/cuda-c-best-practices-guide/index.html
- CUDA C++ Programming Guide, execution and memory model background: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html

Last cross-check date: 2026-03-20
