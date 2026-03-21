---
name: compute-bound-kernel-optimization-playbook
description: "Compute-bound kernel optimization playbook: instruction mix, occupancy/ILP balance, register pressure control, and path selection."
metadata:
  languages: "cpp"
  versions: "13.1"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,compute-bound,optimization,instruction-mix,occupancy,ilp,register-pressure,cuda-core,tensor-core"
---

# Compute-Bound Kernel Optimization Playbook (C++)

Use this page after profiling indicates arithmetic throughput is the dominant limiter.

## Primary Objectives

- Improve useful instruction issue rate.
- Reduce dependency and scheduling stalls.
- Select the right arithmetic path (CUDA Core vs Tensor Core).

## High-Impact Levers

- Improve instruction mix in hot loops.
- Balance occupancy and ILP.
- Control register usage to avoid spill-driven regressions.
- Evaluate Tensor Core migration only when workload shape supports it.

## Triage Sequence

1. Confirm the kernel is truly compute-bound after memory cleanup.
2. Inspect stall reasons related to dependencies and issue efficiency.
3. Tune unroll depth and block geometry together.
4. Re-evaluate path selection (`cuda-core` vs `wmma`/Tensor Core).

## Common Failure Modes

- Aggressive unrolling increases spills and slows kernel.
- Occupancy chasing hurts per-warp progress.
- Tensor Core migration applied to non-matrix-like workloads.

## Verification Checklist

- Throughput metrics improve with stable correctness.
- Register spills do not increase unexpectedly.
- End-to-end runtime improves for production-representative shapes.

## Related Topics

- Compute throughput: `../compute-throughput/DOC.md`
- CUDA Core path: `../cuda-core/DOC.md`
- CUDA Core optimization checklist: `../cuda-core-optimization-checklist/DOC.md`
- Tensor Cores: `../tensor-cores/DOC.md`
- CUDA Core vs Tensor Core path selection: `../cuda-core-vs-tensor-core-path-selection/DOC.md`
- Kernel bottleneck diagnosis workflow: `../kernel-bottleneck-diagnosis-workflow/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Programming Guide, arithmetic throughput context: https://docs.nvidia.com/cuda/cuda-c-programming-guide/
- CUDA C++ Best Practices Guide: https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/
- Nsight Compute Profiling Guide: https://docs.nvidia.com/nsight-compute/2024.2/ProfilingGuide/index.html

Last cross-check date: 2026-03-20

