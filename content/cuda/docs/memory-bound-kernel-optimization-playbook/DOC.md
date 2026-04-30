---
name: memory-bound-kernel-optimization-playbook
description: "Memory-bound kernel optimization playbook: coalescing, cache locality, shared-memory staging, and bandwidth-focused validation."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,memory-bound,optimization,coalescing,cache,shared-memory,bandwidth,staging,latency"
---

# Memory-Bound Kernel Optimization Playbook (C++)

Use this page after profiling confirms the kernel is limited by memory movement instead of arithmetic throughput.

## Primary Objectives

- Increase effective bandwidth.
- Reduce wasted traffic.
- Improve locality and access regularity.

## High-Impact Levers

- Coalesced global-memory access.
- Reuse through registers/shared memory.
- Shared-memory layouts that avoid severe bank conflicts.
- Data-layout changes that reduce strided/scattered loads.

## Triage Sequence

1. Validate coalescing quality for major tensors.
2. Check L1/L2 reuse opportunity and cache-policy behavior.
3. Add or improve shared-memory staging for high-reuse tiles.
4. Recheck occupancy/register pressure after staging changes.

## Common Failure Modes

- Correct staging logic but poor layout (bank conflicts dominate).
- More shared memory with no reuse gain (occupancy drops, throughput worsens).
- Overly complex index math adds latency and defeats memory gains.

## Verification Checklist

- Achieved bandwidth increases in profiler metrics.
- Memory-related warp stalls decrease in hot sections.
- Total runtime improves on representative production shapes.

## Related Topics

- Coalescing: `../coalescing/DOC.md`
- Shared memory: `../shared-memory/DOC.md`
- Cache behavior: `../cache-behavior-and-access-policy/DOC.md`
- Data layout and alignment: `../data-layout-and-alignment/DOC.md`
- Kernel bottleneck diagnosis workflow: `../kernel-bottleneck-diagnosis-workflow/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Best Practices Guide, memory optimizations: https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/
- CUDA C++ Programming Guide, memory hierarchy and access behavior: https://docs.nvidia.com/cuda/cuda-c-programming-guide/
- Nsight Compute Profiling Guide: https://docs.nvidia.com/nsight-compute/2024.2/ProfilingGuide/index.html

Last cross-check date: 2026-03-20

