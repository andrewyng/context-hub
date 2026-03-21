---
name: launch-bound-optimization-playbook
description: "Launch-bound optimization playbook: reducing launch overhead, improving overlap, and deciding when to use fusion or CUDA Graphs."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,launch-bound,optimization,launch-overhead,cuda-graphs,fusion,stream-overlap,orchestration"
---

# Launch-Bound Optimization Playbook (C++)

Use this page when many short kernels or orchestration overhead dominate runtime.

## Primary Objectives

- Reduce launch overhead.
- Increase useful overlap between copy and compute.
- Simplify scheduling structure for repeated execution patterns.

## High-Impact Levers

- Reduce kernel launch count where semantically safe.
- Apply kernel fusion when it improves end-to-end cost.
- Evaluate CUDA Graphs for repetitive execution DAGs.
- Improve stream/event structure to avoid accidental serialization.

## Triage Sequence

1. Confirm launch/orchestration bottleneck in timeline profiling.
2. Identify high-frequency short kernels and synchronization hotspots.
3. Test fusion and graph capture candidates.
4. Reprofile overlap and CPU-side launch cost.

## Common Failure Modes

- Fusion increases register pressure and hurts throughput.
- Graph capture applied to highly dynamic control flow without clear gain.
- Stream dependencies unintentionally serialize work.

## Verification Checklist

- CPU launch overhead decreases.
- Timeline overlap improves.
- Overall runtime drops on production traces, not just micro-tests.

## Related Topics

- CUDA Graphs: `../cuda-graphs/DOC.md`
- Fused kernel design patterns: `../fused-kernel-design-patterns/DOC.md`
- Streams and events: `../streams-and-events/DOC.md`
- NVTX and profiling workflow: `../nvtx-and-profiling-workflow/DOC.md`
- Kernel bottleneck diagnosis workflow: `../kernel-bottleneck-diagnosis-workflow/DOC.md`

## Official Source Links (Fact Check)

- CUDA Graphs programming guidance: https://docs.nvidia.com/cuda/cuda-c-programming-guide/
- Nsight Systems User Guide: https://docs.nvidia.com/nsight-systems/UserGuide/index.html
- CUDA C++ Best Practices Guide: https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/

Last cross-check date: 2026-03-20

