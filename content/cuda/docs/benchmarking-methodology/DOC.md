---
name: benchmarking-methodology
description: "CUDA benchmarking methodology essentials: warmup, synchronization discipline, stable inputs, percentile reporting, and fair comparisons."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,benchmark,methodology,warmup,timing,percentile,variance,fair-comparison"
---

# CUDA Benchmarking Methodology (C++)

Use this page when you need benchmark numbers that are comparable and reproducible.

## Core Rules

1. measure steady state, not cold start.
2. use correct synchronization for the scope being measured.
3. keep input shapes and distributions fixed across variants.
4. report variability, not just one best run.

## Warmup

Always include warmup iterations before measurement to absorb:

- JIT or first-use overheads
- cache/allocator/transient startup effects

## Timing Discipline

For kernel timing:

- use event-based timing around the measured stream segment
- avoid mixing host wall-clock timing with unsynchronized device work

For end-to-end latency:

- include all relevant host/device stages intentionally
- document what is excluded

## Comparison Hygiene

- same hardware and driver/toolkit
- same input set and batch strategy
- same precision and algorithm settings
- same determinism flags where relevant

Any mismatch here can invalidate claimed speedups.

## Reporting

Report at least:

- median
- p90/p95 (or similar tail percentile)
- run-to-run variance

Single minimum time is not sufficient for production-facing claims.

## Related Topics

- Streams and events: `../streams-and-events/DOC.md`
- Performance debugging: `../performance-debugging/DOC.md`
- NVTX profiling workflow: `../nvtx-and-profiling-workflow/DOC.md`
- Regression testing and CI: `../regression-testing-and-ci/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Best Practices Guide, measurement and optimization workflow context: https://docs.nvidia.com/cuda/archive/13.0.0/cuda-c-best-practices-guide/index.html
- CUDA Runtime API, event timing APIs: https://docs.nvidia.com/cuda/cuda-runtime-api/index.html

Last cross-check date: 2026-03-20
