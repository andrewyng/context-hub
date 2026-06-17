---
name: numerics-and-precision
description: "CUDA numerics and precision essentials: FP16/BF16/TF32 behavior, accumulation choices, and stability-aware kernel design."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,numerics,precision,fp16,bf16,tf32,accumulation,rounding,tensor-cores"
---

# CUDA Numerics And Precision (C++)

Use this page when correctness and performance depend on precision mode choices.

## Precision Choices Matter

CUDA kernels often trade off:

- throughput
- memory footprint
- numeric stability

Common formats include FP32, FP16, BF16, and TF32 (Tensor Core-oriented math mode).

## Storage Type vs Accumulation Type

A robust pattern is mixed precision:

- store inputs in lower precision (for bandwidth / throughput)
- accumulate in higher precision (for stability)

Example direction:

- FP16/BF16 inputs with FP32 accumulation for reductions and GEMM-like operations.

## Tensor Core Precision Modes

Tensor Core paths can use type-specific behavior (for example TF32/FP16/BF16 combinations depending on architecture and library mode).

When enabling Tensor Core math modes:

- verify expected numeric tolerance
- compare against a high-precision baseline
- record configuration to keep benchmark results reproducible

## Common Instability Patterns

- long reductions in low precision
- subtractive cancellation with similar-magnitude values
- iterative algorithms without periodic re-normalization

## Practical Guardrails

1. define accuracy targets first (absolute/relative tolerance).
2. choose accumulation precision before micro-optimizing.
3. test on representative dynamic ranges, not only random unit-scale inputs.
4. keep a reference path (often FP32 accumulation) for regression checks.

## Related Topics

- Tensor Core usage: `../tensor-cores/DOC.md`
- Tensor Core numerical validation: `../tensor-core-numerical-validation/DOC.md`
- WMMA debugging checklist: `../wmma-debugging-checklist/DOC.md`
- Compute throughput: `../compute-throughput/DOC.md`
- Performance debugging: `../performance-debugging/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Programming Guide, floating-point and mixed precision behavior: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html
- CUDA C++ Programming Guide, WMMA/Tensor Core precision context: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html

Last cross-check date: 2026-03-20
