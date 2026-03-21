---
name: cuda-core-optimization-checklist
description: "CUDA Core optimization checklist: coalescing, divergence control, occupancy/ILP balancing, and measurement-first tuning."
metadata:
  languages: "cpp"
  versions: "13.1"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,cuda-core,optimization,checklist,coalescing,divergence,occupancy,ilp,register-pressure,latency-hiding"
---

# CUDA Core Optimization Checklist (C++)

Use this page when a kernel is intentionally on the ordinary arithmetic path and needs systematic optimization.

## Step 1: Confirm The Bottleneck Class

Before changing code, classify the kernel:

- memory-bound
- compute-bound
- launch/orchestration-bound

Use profiling first. Do not optimize blind.

## Step 2: Memory Access Quality

- Ensure global-memory accesses are coalesced.
- Reduce redundant loads with reuse (register/shared memory where appropriate).
- Avoid severe shared-memory bank conflicts in staging buffers.

## Step 3: Control Flow Quality

- Reduce divergence in hot warps.
- Make branch conditions uniform where possible.
- Move rare-path logic off hot loops when feasible.

## Step 4: Occupancy And ILP Balance

- Avoid maximizing occupancy as a standalone goal.
- Tune block size, unroll depth, and register footprint together.
- Improve ILP when scoreboard/dependency stalls dominate.

## Step 5: Validate Every Optimization

- Reprofile after each major change.
- Track throughput, stall mix, occupancy, and memory metrics together.
- Keep correctness checks and numerical checks in the loop.

## Common Anti-Patterns

- Chasing one metric (for example occupancy) while total throughput worsens.
- Heavy unrolling that increases register spills.
- Introducing shared memory without fixing access pattern quality.

## Related Topics

- CUDA Core path overview: `../cuda-core/DOC.md`
- Compute throughput: `../compute-throughput/DOC.md`
- Occupancy: `../occupancy/DOC.md`
- Coalescing: `../coalescing/DOC.md`
- Performance debugging: `../performance-debugging/DOC.md`
- Bottleneck diagnosis workflow: `../kernel-bottleneck-diagnosis-workflow/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Programming Guide: https://docs.nvidia.com/cuda/cuda-c-programming-guide/
- CUDA C++ Best Practices Guide: https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/
- Nsight Compute Profiling Guide: https://docs.nvidia.com/nsight-compute/2024.2/ProfilingGuide/index.html

Last cross-check date: 2026-03-20

