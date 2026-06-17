---
name: tensor-core-numerical-validation
description: "Tensor Core numerical validation workflow: baseline comparison, tolerance policy, shape coverage, and regression gates."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,tensor-core,numerics,validation,tolerance,baseline,wmma,tf32,fp16,bf16,regression"
---

# Tensor Core Numerical Validation (C++)

Use this page when enabling WMMA/Tensor Core paths and you need a defensible numerical-validation process.

## Baseline Strategy

- Keep a trusted reference path (often FP32 accumulate).
- Run identical input tensors through baseline and Tensor Core paths.
- Compare per-output error and aggregate metrics.

## Tolerance Policy

Define tolerance before tuning:

- absolute tolerance
- relative tolerance
- special-case handling for near-zero regions

Document tolerance by workload category, not by one benchmark snapshot.

## Coverage Requirements

Validate across:

- representative shapes (small, medium, large)
- boundary shapes (tail tiles, non-multiple dimensions)
- realistic value ranges (not only unit random data)
- production-like batch distributions

## Failure Triage

If error exceeds policy:

- check dtype/accumulator configuration first
- check layout and tile mapping consistency
- check whether a supposedly Tensor Core path silently falls back or changes instruction mix
- re-run with deterministic seeds and fixed launch configs

## Regression Gates

- Add numerical checks into CI for key shapes.
- Keep per-architecture baselines where behavior differs by hardware mode.
- Block performance-only changes when they break agreed numeric policy.

## Related Topics

- Tensor Cores: `../tensor-cores/DOC.md`
- WMMA patterns: `../wmma-kernel-patterns/DOC.md`
- WMMA debugging checklist: `../wmma-debugging-checklist/DOC.md`
- Numerics and precision: `../numerics-and-precision/DOC.md`
- Regression testing and CI: `../regression-testing-and-ci/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Programming Guide, floating-point behavior and Tensor Core context: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html
- CUDA C++ Best Practices Guide, verification guidance: https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/

Last cross-check date: 2026-03-20

