---
name: production-readiness-checklist
description: "CUDA production-readiness checklist: correctness gates, performance stability, observability, compatibility, and rollout safeguards."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,production,readiness,checklist,observability,compatibility,rollback,release-gates"
---

# CUDA Production Readiness Checklist (C++)

Use this page before shipping optimized CUDA kernels to production environments.

## 1) Correctness Gates

- reference-baseline comparison on representative datasets
- tolerance policy per precision mode
- stress tests for boundary sizes and adversarial shapes
- deterministic/reproducibility expectations documented

## 2) Performance Gates

- benchmark methodology fixed and repeatable
- p50/p95 latency and throughput baselines recorded
- regression thresholds defined and enforced in CI/perf jobs
- cold-start versus steady-state behavior measured

## 3) Observability

- NVTX ranges present for major pipeline phases
- key metrics exported (latency, error rates, fallback rate)
- profiler workflows documented for oncall debugging

## 4) Compatibility

- target `-gencode` matrix matches deployment fleet
- driver/toolkit compatibility validated
- fallback path behavior tested when preferred kernels are unavailable

## 5) Operational Safety

- feature flag or staged rollout strategy
- fast rollback path
- runtime guardrails for unexpected shapes/resource exhaustion

## 6) Documentation Hygiene

- kernel assumptions and constraints documented
- precision and determinism modes documented
- known limitations and troubleshooting notes linked

## Related Topics

- Regression testing and CI: `../regression-testing-and-ci/DOC.md`
- Benchmarking methodology: `../benchmarking-methodology/DOC.md`
- Build and ABI compatibility: `../build-and-abi-compatibility/DOC.md`
- NVTX profiling workflow: `../nvtx-and-profiling-workflow/DOC.md`
- Fallback strategies and capability detection: `../fallback-strategies-and-capability-detection/DOC.md`
- Incident response and rollback playbook: `../incident-response-and-rollback-playbook/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Best Practices Guide: https://docs.nvidia.com/cuda/archive/13.0.0/cuda-c-best-practices-guide/index.html
- CUDA Compatibility documentation: https://docs.nvidia.com/deploy/cuda-compatibility/index.html
- Nsight Systems / Compute docs for observability workflows:
  - https://docs.nvidia.com/nsight-systems/UserGuide/index.html
  - https://docs.nvidia.com/nsight-compute/2024.2/ProfilingGuide/index.html

Last cross-check date: 2026-03-20
