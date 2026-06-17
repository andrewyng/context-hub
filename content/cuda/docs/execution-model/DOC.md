---
name: execution-model
description: "CUDA execution model essentials: warps, SM scheduling, divergence, and how ordinary arithmetic paths differ from Tensor Core paths."
metadata:
  languages: "cpp"
  versions: "13.1"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,execution-model,simt,warp,sm,scheduler,divergence,cuda-core,tensor-core"
---

# CUDA Execution Model (C++)

Use this page to understand how CUDA threads are grouped and scheduled, and how ordinary arithmetic execution differs from Tensor Core execution.

## SIMT Basics

CUDA executes threads in groups of 32 called warps.

- a warp is the main scheduling unit inside an SM
- threads in a warp conceptually execute the same kernel code in SIMT style
- divergence inside a warp reduces efficiency because different branch paths are executed separately

This is why block sizes are usually chosen as multiples of 32.

## SM-Level Scheduling

An SM manages many resident warps and switches among them to hide latency.

- when one warp stalls on memory or dependencies, the SM can issue instructions from another ready warp
- latency hiding depends on both occupancy and instruction-level parallelism
- exact scheduler and execution-unit details vary by architecture

## What Developers Mean By "CUDA Core"

NVIDIA documentation usually talks about instruction throughput, FP32/INT32/FP64 units, and SM execution resources rather than a CUDA C++ API called "CUDA Core".

In practice, developers use "CUDA Core path" to mean:

- ordinary arithmetic instructions such as FP32 / INT32 math
- standard SIMT execution on the SM's general arithmetic pipelines
- kernels that do not explicitly target Tensor Core matrix instructions

This is an interpretation of the hardware execution model, not a separate CUDA C++ programming interface.

## Tensor Core Path

Tensor Cores are specialized matrix-multiply-accumulate units.

- they are exposed in CUDA C++ through warp-level matrix APIs such as `nvcuda::wmma`
- they are exposed in PTX through matrix instructions such as `wgmma`
- they are most relevant when the computation naturally maps to small matrix tiles and supported types/layouts

If a kernel is written using ordinary scalar or vector arithmetic, it is usually on the ordinary SM arithmetic path rather than the Tensor Core path.

## Divergence And Utilization

Ordinary arithmetic kernels often lose efficiency because of:

- warp divergence
- uncoalesced memory access
- bank conflicts
- low occupancy or long dependency chains

Tensor Core kernels add extra constraints:

- warp-wide participation
- shape / layout / alignment restrictions
- staging and synchronization overhead around fragments or async pipelines

## Rule Of Thumb

- generic elementwise, reduction, indexing-heavy, and control-heavy kernels usually live on the ordinary arithmetic path
- dense matrix-multiply-like kernels are the main candidates for Tensor Core acceleration

## Related Topics

- CUDA Core path: `../cuda-core/DOC.md`
- Compute throughput model: `../compute-throughput/DOC.md`
- Occupancy tuning: `../occupancy/DOC.md`
- Warp-level primitives: `../warp-primitives/DOC.md`
- Tensor Core API usage: `../tensor-cores/DOC.md`
- WMMA kernel patterns: `../wmma-kernel-patterns/DOC.md`
- CUDA Core vs Tensor Core path selection: `../cuda-core-vs-tensor-core-path-selection/DOC.md`

## Official Source Links (Fact Check)

- CUDA Programming Guide, programming model and warps: https://docs.nvidia.com/cuda/archive/13.1.1/cuda-programming-guide/01-introduction/programming-model.html
- CUDA Programming Guide, SIMT execution model: https://docs.nvidia.com/cuda/cuda-programming-guide/03-advanced/advanced-kernel-programming.html
- Turing Tuning Guide, SM scheduling and execution resources: https://docs.nvidia.com/cuda/archive/12.4.0/turing-tuning-guide/index.html

Last cross-check date: 2026-03-20
