---
name: tensor-core-pipeline-patterns
description: "Tensor Core pipeline patterns: global-to-shared staging, multi-stage K loops, async copy synchronization, and escalation to WGMMA/TMA."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,tensor-core,tensorcore,pipeline,pipelining,multi-stage-pipeline,cp.async,async-copy,shared-memory,mbarrier,wmma,wgmma,tma,double-buffering,stage-depth"
---

# Tensor Core Pipeline Patterns (C++)

Use this page for end-to-end Tensor Core kernel structure, not just a single `mma_sync` call.

## Why Pipeline Design Dominates

In real GEMM-like kernels, arithmetic throughput is often high enough that data staging and synchronization decide final performance.

A strong Tensor Core kernel usually needs:

- global-memory tile fetch
- shared-memory staging and layout control
- fragment load and matrix instruction issue
- overlapped staging for the next K tile

## Canonical Multi-Stage Loop

A practical loop has at least two stages:

1. Stage N: copy tile data for current compute.
2. Stage N+1: prefetch tile data for next compute step.

With larger K, three-stage pipelines can smooth latency at the cost of more shared memory and register pressure.

## Synchronization Boundaries

You need explicit boundaries between:

- producer writes to shared memory
- consumer fragment loads
- matrix instruction issue
- buffer reuse for next stage

At C++ level this usually means structured barrier usage. At lower levels it can include async-copy wait semantics and mbarrier protocols.

## Shared-Memory Layout Rules

Tensor Core pipelines fail or slow down when shared layout is wrong.

- align tile rows/strides for load requirements
- avoid severe bank conflicts in the staging pattern
- keep layout choices consistent with fragment load layout expectations

## Stage-Depth Tradeoff

More stages can hide memory latency better, but also:

- increase shared-memory footprint per block
- reduce occupancy
- increase control complexity

Tune stage count jointly with block-level warp count and tile shapes.

## WMMA vs WGMMA/TMA Escalation

Stay with WMMA-focused C++ pipeline when:

- supported tile shapes and types fit
- performance is acceptable after staging and synchronization tuning

Escalate toward lower-level PTX workflows when:

- you need architecture-specific warpgroup matrix instructions
- you need advanced async tensor movement control
- your kernel requires fine-grained control beyond C++ WMMA surface area

## Profiling Checks

- matrix instruction activity is present and dominant in hot loops
- shared-memory pressure is not causing severe bank-serialization stalls
- memory pipeline overlaps compute in timeline and stall analysis
- occupancy remains sufficient for latency hiding

## Related Topics

- Tensor Core API overview: `../tensor-cores/DOC.md`
- WMMA practical patterns: `../wmma-kernel-patterns/DOC.md`
- Shared memory: `../shared-memory/DOC.md`
- Async copy: `../async-copy/DOC.md`
- Performance debugging: `../performance-debugging/DOC.md`
- PTX TMA: `../ptx/instructions/tma/DOC.md`
- PTX WGMMA: `../ptx/instructions/wgmma/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Programming Guide, asynchronous data movement and pipelines: https://docs.nvidia.com/cuda/cuda-c-programming-guide/
- CUDA C++ Best Practices Guide, async copy and memory staging: https://docs.nvidia.com/cuda/archive/13.0.0/cuda-c-best-practices-guide/index.html
- PTX ISA docs for advanced matrix/tensor movement paths: https://docs.nvidia.com/cuda/parallel-thread-execution/

Last cross-check date: 2026-03-20
