---
name: fused-kernel-design-patterns
description: "CUDA fused-kernel design essentials: when fusion helps, when it hurts, and practical patterns for memory-traffic reduction."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,fusion,fused-kernel,memory-traffic,register-pressure,launch-overhead,epilogue-fusion"
---

# CUDA Fused-Kernel Design Patterns (C++)

Use this page when deciding whether to combine multiple operations into one kernel.

## Why Fusion Helps

Fusion can improve performance by:

- reducing global-memory round trips
- reducing kernel-launch overhead
- keeping intermediate values in registers/shared memory

## Why Fusion Can Hurt

Over-fusion can degrade performance due to:

- register pressure and spills
- lower occupancy
- larger instruction footprint
- harder scheduling and poorer maintainability

Fusion is beneficial only when memory/launch savings outweigh these costs.

## Common Fusion Patterns

- elementwise chain fusion (A->B->C)
- reduction + lightweight post-processing
- GEMM epilogue fusion (bias/add/activation)
- load-transform-store pipelines with shared-memory staging

## Practical Decision Rule

Fuse when:

- intermediate tensors are large
- extra kernel boundaries dominate runtime
- the fused kernel remains resource-balanced

Do not fuse when:

- each op is already compute-heavy and well-optimized
- fusion introduces high register pressure or complex control divergence

## Validation Workflow

1. benchmark unfused baseline.
2. fuse one boundary at a time.
3. profile register usage, spills, occupancy, and bandwidth.
4. keep fusion only where end-to-end latency improves.

## Related Topics

- Coalescing: `../coalescing/DOC.md`
- Occupancy: `../occupancy/DOC.md`
- Launch bounds and registers: `../launch-bounds-and-registers/DOC.md`
- CUDA Graphs: `../cuda-graphs/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Best Practices Guide, memory and launch optimization context: https://docs.nvidia.com/cuda/archive/13.0.0/cuda-c-best-practices-guide/index.html
- CUDA C++ Programming Guide, execution and memory behavior background: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html

Last cross-check date: 2026-03-20
