---
name: wmma-debugging-checklist
description: "WMMA debugging checklist: fragment/layout mismatches, leading-dimension issues, warp participation errors, and profiling verification."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,wmma,debugging,checklist,tensor-core,fragment,load_matrix_sync,mma_sync,store_matrix_sync,ldm,alignment"
---

# WMMA Debugging Checklist (C++)

Use this page when a WMMA kernel is incorrect, unstable, or unexpectedly slow.

## Correctness Checklist

- Warp participation is complete for every WMMA call.
- `matrix_a` / `matrix_b` layout templates match actual memory layout.
- `ldm` values are in elements and match tensor strides.
- Load/store pointers satisfy required alignment.
- Accumulator type and final store type match intended precision policy.

## Common Failure Signatures

- Output full of zeros or repeated blocks: wrong pointer arithmetic or tile mapping.
- Numerically wrong but stable shape: wrong layout or `ldm` mismatch.
- Intermittent corruption: partial-warp execution or out-of-bounds tile guards.
- Correct output but poor speed: data staging dominates, not matrix instruction issue.

## Profiling Checklist

- Confirm matrix instruction activity is present.
- Confirm expected hot kernels use Tensor Core-capable instruction mix.
- Check shared-memory staging quality and bank-conflict pressure.
- Check occupancy/register pressure after unrolling and staging changes.

## Minimal Debug Order

1. Validate one warp, one tile, one K-step.
2. Validate full K-loop accumulation.
3. Scale to multi-warp block mapping.
4. Add pipelining/staging optimizations only after correctness is stable.

## Related Topics

- Tensor Core overview: `../tensor-cores/DOC.md`
- WMMA kernel patterns: `../wmma-kernel-patterns/DOC.md`
- Tensor Core pipeline patterns: `../tensor-core-pipeline-patterns/DOC.md`
- Numerics and precision: `../numerics-and-precision/DOC.md`
- Tensor Core numerical validation: `../tensor-core-numerical-validation/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Programming Guide, WMMA APIs: https://docs.nvidia.com/cuda/cuda-c-programming-guide/
- CUDA C++ Programming Guide, Tensor Core restrictions: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html
- Nsight Compute Profiling Guide: https://docs.nvidia.com/nsight-compute/2024.2/ProfilingGuide/index.html

Last cross-check date: 2026-03-20

