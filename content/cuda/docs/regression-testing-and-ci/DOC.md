---
name: regression-testing-and-ci
description: "CUDA regression testing and CI essentials: correctness baselines, tolerance strategy, perf guardrails, and multi-arch validation."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,testing,regression,ci,correctness,tolerance,performance-guardrail,multi-arch"
---

# CUDA Regression Testing And CI (C++)

Use this page to keep CUDA kernels stable across optimizations and toolchain updates.

## Test Layers

Keep separate layers:

- functional correctness tests
- numerical tolerance tests
- performance regression tests

Blending all three into one pass makes failures hard to diagnose.

## Correctness Baselines

- keep a trusted reference path (CPU or high-precision GPU)
- compare output shapes, boundary behavior, and representative edge cases
- include deterministic seeds for stochastic paths

## Tolerance Policy

Define tolerance per operator class and precision mode.

- tighter for stable FP32 math
- looser but explicit for FP16/BF16/TF32 or nondeterministic orderings

Store tolerance policy in code/config, not ad-hoc comments.

## Performance Guardrails

- track key benchmarks in CI (or scheduled perf jobs)
- compare against a baseline window, not a single run
- alert on sustained regression beyond threshold

## Multi-Arch Validation

When possible, validate across representative GPU classes.

- architecture differences can expose hidden assumptions
- build matrices should reflect deployment reality

## Related Topics

- Build and ABI compatibility: `../build-and-abi-compatibility/DOC.md`
- Benchmarking methodology: `../benchmarking-methodology/DOC.md`
- Numerics and precision: `../numerics-and-precision/DOC.md`
- Randomness and reproducibility: `../randomness-and-reproducibility/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Best Practices Guide, verification and optimization workflow context: https://docs.nvidia.com/cuda/archive/13.0.0/cuda-c-best-practices-guide/index.html
- CUDA Programming Guide, numerical/ordering considerations: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html

Last cross-check date: 2026-03-20
