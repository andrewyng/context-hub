---
name: incident-response-and-rollback-playbook
description: "CUDA incident-response essentials: triage, rollback criteria, mitigation levers, and post-incident hardening steps."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,incident,response,rollback,mitigation,triage,oncall,postmortem"
---

# Incident Response And Rollback Playbook (C++)

Use this page when a CUDA optimization regresses latency, correctness, or stability in production.

## Fast Triage Checklist

1. identify blast radius (which models/tasks/hardware).
2. classify failure mode (correctness, latency, crash, OOM, timeout).
3. isolate recent kernel/config/toolchain changes.
4. determine safe rollback target.

## Rollback Criteria

Rollback immediately when:

- correctness deviations exceed policy
- crash rate or timeout rate breaches SLO
- latency regression is severe and sustained

Do not wait for perfect root-cause certainty before restoring service.

## Mitigation Levers

- disable risky fast paths via feature flags
- switch to known-safe kernel variant
- reduce batch size or concurrency temporarily
- force conservative precision/mode where necessary

## Evidence Collection

- capture failing inputs and minimal repro shapes
- record selected kernel path/capability info
- collect timeline + kernel profiles for before/after comparison

## Post-Incident Hardening

- add regression tests for the triggering pattern
- add rollout guardrails (canary, staged enablement)
- improve observability for path-selection and error counters
- document lessons and owner actions

## Related Topics

- Production readiness checklist: `../production-readiness-checklist/DOC.md`
- Regression testing and CI: `../regression-testing-and-ci/DOC.md`
- NVTX profiling workflow: `../nvtx-and-profiling-workflow/DOC.md`
- Fallback strategies: `../fallback-strategies-and-capability-detection/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Best Practices Guide (verification + optimization workflow context): https://docs.nvidia.com/cuda/archive/13.0.0/cuda-c-best-practices-guide/index.html
- Nsight Systems / Nsight Compute docs for triage instrumentation:
  - https://docs.nvidia.com/nsight-systems/UserGuide/index.html
  - https://docs.nvidia.com/nsight-compute/2024.2/ProfilingGuide/index.html

Last cross-check date: 2026-03-20
