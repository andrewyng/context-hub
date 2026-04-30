---
name: nsight-metrics-interpretation-cheatsheet
description: "Nsight metrics interpretation cheatsheet: practical mapping from common metric patterns to likely bottleneck classes and next actions."
metadata:
  languages: "cpp"
  versions: "2024.2"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,nsight,metrics,profiling,interpretation,warp-stalls,occupancy,bandwidth,bottleneck"
---

# Nsight Metrics Interpretation Cheatsheet (C++)

Use this page for fast mapping from profiler symptoms to likely root causes and next steps.

## Symptom To Action Map

- High memory pressure + low arithmetic utilization:
  likely memory-bound, prioritize coalescing/layout/reuse.
- Low issue efficiency + dependency-heavy stalls:
  likely compute-bound scheduling/dependency bottleneck.
- Many short kernels + high CPU orchestration share:
  likely launch-bound, evaluate fusion/graphs/overlap changes.

## Warp Stall Reading Rules

- Treat stall reasons as supporting evidence, not standalone truth.
- Interpret stall categories together with achieved throughput and occupancy.
- Re-check after each optimization stage because dominant stalls can shift.

## Minimal Workflow

1. Timeline classify (Nsight Systems).
2. Kernel-level metrics drilldown (Nsight Compute).
3. Route to memory/compute/launch playbook.
4. Reprofile and confirm bottleneck shift.

## Related Topics

- Performance debugging: `../performance-debugging/DOC.md`
- Kernel bottleneck diagnosis workflow: `../kernel-bottleneck-diagnosis-workflow/DOC.md`
- Memory-bound playbook: `../memory-bound-kernel-optimization-playbook/DOC.md`
- Compute-bound playbook: `../compute-bound-kernel-optimization-playbook/DOC.md`
- Launch-bound playbook: `../launch-bound-optimization-playbook/DOC.md`

## Official Source Links (Fact Check)

- Nsight Compute Profiling Guide: https://docs.nvidia.com/nsight-compute/2024.2/ProfilingGuide/index.html
- Nsight Systems User Guide: https://docs.nvidia.com/nsight-systems/UserGuide/index.html

Last cross-check date: 2026-03-20

