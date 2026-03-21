---
name: kernel-bottleneck-diagnosis-workflow
description: "Kernel bottleneck diagnosis workflow: classify memory-bound vs compute-bound vs launch-bound, then choose targeted optimization paths."
metadata:
  languages: "cpp"
  versions: "2024.2"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,bottleneck,diagnosis,workflow,memory-bound,compute-bound,launch-bound,profiling,nsight"
---

# Kernel Bottleneck Diagnosis Workflow (C++)

Use this page when you need a repeatable way to decide which optimization direction is actually relevant.

## Classification First

Classify each hot kernel into one of three primary classes:

- memory-bound
- compute-bound
- launch/orchestration-bound

Do this with profiling evidence, not intuition.

## Evidence Signals

Memory-bound indicators:

- high memory-pipeline utilization with low arithmetic utilization
- strong sensitivity to coalescing/layout changes

Compute-bound indicators:

- arithmetic pipeline pressure dominates
- throughput improves mainly with instruction-mix or scheduling improvements

Launch-bound indicators:

- many short kernels
- significant CPU/launch overhead and weak overlap

## Optimization Routing

If memory-bound:

- prioritize coalescing, reuse, layout, and staging fixes.

If compute-bound:

- optimize instruction mix, occupancy/ILP balance, and path selection (CUDA Core vs Tensor Core).

If launch-bound:

- reduce launch count, fuse kernels where valid, and evaluate CUDA Graphs.

## Guardrails

- Reclassify after each major optimization; bottleneck class can change.
- Keep correctness and numerical checks active during performance iteration.
- Record profiler snapshots per step to avoid regression ambiguity.

## Related Topics

- Performance debugging: `../performance-debugging/DOC.md`
- Compute throughput: `../compute-throughput/DOC.md`
- Memory-bound optimization playbook: `../memory-bound-kernel-optimization-playbook/DOC.md`
- Compute-bound optimization playbook: `../compute-bound-kernel-optimization-playbook/DOC.md`
- Launch-bound optimization playbook: `../launch-bound-optimization-playbook/DOC.md`
- Nsight metrics interpretation cheatsheet: `../nsight-metrics-interpretation-cheatsheet/DOC.md`
- CUDA Core optimization checklist: `../cuda-core-optimization-checklist/DOC.md`
- CUDA Core vs Tensor Core path selection: `../cuda-core-vs-tensor-core-path-selection/DOC.md`
- CUDA Graphs: `../cuda-graphs/DOC.md`
- Fused kernel design patterns: `../fused-kernel-design-patterns/DOC.md`

## Official Source Links (Fact Check)

- Nsight Systems User Guide: https://docs.nvidia.com/nsight-systems/UserGuide/index.html
- Nsight Compute Profiling Guide: https://docs.nvidia.com/nsight-compute/2024.2/ProfilingGuide/index.html
- CUDA C++ Best Practices Guide: https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/

Last cross-check date: 2026-03-20
