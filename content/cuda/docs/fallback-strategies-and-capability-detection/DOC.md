---
name: fallback-strategies-and-capability-detection
description: "CUDA capability detection and fallback essentials: feature probes, architecture guards, and safe runtime degradation paths."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,capability-detection,fallback,feature-probe,sm-version,graceful-degradation,runtime-guards"
---

# Fallback Strategies And Capability Detection (C++)

Use this page when kernels depend on architecture-specific features (Tensor Cores, clusters, async paths, etc.).

## Capability Detection

Query device properties at runtime and gate features explicitly.

Typical inputs:

- compute capability (SM version)
- shared-memory limits
- cooperative/cluster support
- peer access/topology capabilities

Do not infer support from GPU name strings.

## Fallback Hierarchy

Define ordered execution paths:

1. preferred fast path (feature-rich)
2. compatible optimized fallback
3. conservative correctness fallback

All paths should be tested; fallback code is production code.

## Guardrail Principles

- fail fast for unsupported required features
- degrade gracefully for optional accelerations
- log selected path for observability and debugging

## Common Mistakes

- fallback exists but is untested
- path selection logic diverges from documented requirements
- silent fallback causes unnoticed performance regressions

## Related Topics

- Build and ABI compatibility: `../build-and-abi-compatibility/DOC.md`
- Multi-GPU and peer access: `../multi-gpu-and-peer-access/DOC.md`
- Production readiness checklist: `../production-readiness-checklist/DOC.md`

## Official Source Links (Fact Check)

- CUDA Runtime API, device property query interfaces: https://docs.nvidia.com/cuda/cuda-runtime-api/index.html
- CUDA C++ Programming Guide, architecture/capability-dependent feature context: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html

Last cross-check date: 2026-03-20
