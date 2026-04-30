---
name: cuda-core-vs-tensor-core-path-selection
description: "Path selection guide: deciding between CUDA Core and Tensor Core execution using workload shape, dtype, layout, and numerical constraints."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,cuda-core,tensor-core,path-selection,wmma,wgmma,dtype,layout,precision,fallback"
---

# CUDA Core vs Tensor Core Path Selection (C++)

Use this page when deciding whether to implement or keep a kernel on ordinary arithmetic pipelines or move it to Tensor Core matrix instructions.

## Fast Decision Matrix

Choose CUDA Core path first when:

- operation is elementwise, reduction-heavy, sparse, or control-heavy
- matrix structure is weak or tile reuse is poor
- required dtype/layout does not map cleanly to Tensor Core-supported combinations

Choose Tensor Core path first when:

- workload is dominated by dense matrix-multiply-accumulate
- shape and layout can be tiled consistently at warp or warpgroup granularity
- allowed dtype/accumulation policy matches supported Tensor Core paths

## Data-Type And Numerics Gate

Before migration, verify:

- multiplicand and accumulator types are supported by the target path
- error budget tolerates the chosen precision policy
- baseline parity tests pass with realistic input distributions

If these checks fail, forcing Tensor Core instructions can create unstable numerics or hidden fallback behavior.

## Layout And Staging Gate

Tensor Core speedups depend on movement cost.

Require:

- consistent layout contracts (`row_major`/`col_major`, leading dimensions)
- efficient shared-memory staging plan
- synchronization protocol that does not serialize hot loops

If memory behavior remains dominant after staging optimization, keep CUDA Core path and optimize arithmetic/memory overlap there.

## Performance Validation Protocol

1. Build a correctness baseline.
2. Profile CUDA Core implementation to identify real bottlenecks.
3. Implement Tensor Core path candidate.
4. Compare throughput, memory pressure, occupancy, and stall behavior.
5. Keep the faster path under expected production shapes, not just synthetic peak cases.

## Fallback Strategy

Production kernels should keep explicit fallback behavior:

- capability checks for architecture/toolchain support
- shape or dtype guards for unsupported combinations
- deterministic fallback to CUDA Core implementation

This avoids silent behavior drift across deployment environments.

## Practical Rule Of Thumb

- Default to CUDA Core path for generality and low complexity.
- Move to Tensor Core path for matrix-dense hotspots after profiling confirms arithmetic throughput is the limiting factor.
- Keep both paths when workload diversity is high.

## Related Topics

- CUDA Core path: `../cuda-core/DOC.md`
- Tensor Core overview: `../tensor-cores/DOC.md`
- WMMA practical patterns: `../wmma-kernel-patterns/DOC.md`
- Tensor Core pipeline patterns: `../tensor-core-pipeline-patterns/DOC.md`
- Fallback/capability detection: `../fallback-strategies-and-capability-detection/DOC.md`
- Numerics and precision: `../numerics-and-precision/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Programming Guide (execution model, WMMA, memory model): https://docs.nvidia.com/cuda/cuda-c-programming-guide/
- CUDA C++ Best Practices Guide (memory and throughput guidance): https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/

Last cross-check date: 2026-03-20

