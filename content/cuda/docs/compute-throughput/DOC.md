---
name: compute-throughput
description: "CUDA compute-throughput essentials: arithmetic throughput tables, latency hiding, and when Tensor Cores beat ordinary arithmetic paths."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,throughput,compute-bound,fp32,fp16,int32,cuda-core,tensor-core,latency-hiding"
---

# CUDA Compute Throughput (C++)

Use this page to reason about whether a kernel is limited by ordinary arithmetic throughput, Tensor Core throughput, or memory behavior.

## The First Split

Ask this first:

- is the kernel memory-bound?
- or is it compute-bound?

If memory traffic dominates, moving from ordinary arithmetic to Tensor Cores may not help much until memory behavior is fixed.

## Ordinary Arithmetic Path

The CUDA Programming Guide publishes per-SM throughput tables for native arithmetic instructions.

These tables show that:

- throughput depends strongly on architecture
- FP32, FP16, INT32, and FP64 do not have the same peak rates
- per-SM throughput must be multiplied by SM count for whole-device peak

So a generic "CUDA Core throughput" number is not enough by itself. The relevant question is which instruction family the kernel actually uses.

## Tensor Core Path

Tensor Cores can provide much higher matrix-multiply-accumulate throughput than ordinary scalar arithmetic paths when:

- the algorithm is matrix-multiply-like
- supported data types are acceptable
- tile shapes and layouts match the API and hardware requirements
- data staging overhead does not erase the gains

This is why GEMM, attention, and convolution-like kernels are common Tensor Core candidates, while control-heavy kernels usually are not.

## Throughput Is Not Just Peak Math

A kernel can miss peak throughput because of:

- dependency chains that the scheduler cannot hide
- low occupancy
- poor instruction mix
- register pressure
- memory stalls before arithmetic units are saturated

So "Tensor Core capable" does not imply "Tensor Core efficient".

## Practical Decision Rule

Stay on the ordinary arithmetic path when:

- the operation is elementwise or irregular
- there is too much branching or indexing complexity
- supported Tensor Core types or layouts do not fit the problem

Move toward Tensor Cores when:

- the kernel is dominated by dense matrix multiply-accumulate
- the math can be tiled at warp granularity
- data movement can be organized cleanly

## What To Check In Practice

- achieved memory bandwidth
- achieved occupancy
- instruction mix
- whether warp-level matrix instructions are present
- whether the kernel is actually compute-bound after memory optimization

## Related Topics

- Execution model: `../execution-model/DOC.md`
- CUDA Core path: `../cuda-core/DOC.md`
- CUDA Core optimization checklist: `../cuda-core-optimization-checklist/DOC.md`
- Occupancy tuning: `../occupancy/DOC.md`
- Tensor Core API usage: `../tensor-cores/DOC.md`
- WMMA debugging checklist: `../wmma-debugging-checklist/DOC.md`
- Tensor Core pipeline patterns: `../tensor-core-pipeline-patterns/DOC.md`
- Tensor Core numerical validation: `../tensor-core-numerical-validation/DOC.md`
- CUDA Core vs Tensor Core path selection: `../cuda-core-vs-tensor-core-path-selection/DOC.md`
- Kernel bottleneck diagnosis workflow: `../kernel-bottleneck-diagnosis-workflow/DOC.md`
- Shared memory staging: `../shared-memory/DOC.md`
- Numerics and precision: `../numerics-and-precision/DOC.md`
- Fused kernel design patterns: `../fused-kernel-design-patterns/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Programming Guide, arithmetic instruction throughput tables: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html
- CUDA C++ Programming Guide, instruction-throughput interpretation: https://docs.nvidia.com/cuda/archive/11.7.0/cuda-c-programming-guide/index.html
- Turing Tuning Guide, SM execution resources and latency hiding discussion: https://docs.nvidia.com/cuda/archive/12.4.0/turing-tuning-guide/index.html

Last cross-check date: 2026-03-20
