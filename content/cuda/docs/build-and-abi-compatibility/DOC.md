---
name: build-and-abi-compatibility
description: "CUDA build and ABI compatibility essentials: arch targets, PTX/SASS forward-compat strategy, runtime/driver constraints, and packaging hygiene."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,build,abi,compatibility,sm-arch,ptx,sass,nvcc,driver-runtime"
---

# CUDA Build And ABI Compatibility (C++)

Use this page when shipping CUDA binaries across different GPU architectures and deployment environments.

## Targeting Strategy

Build artifacts can include:

- SASS for specific SM architectures
- PTX for forward compatibility via JIT on newer compatible drivers

A common practical strategy is to include both:

- native SASS for known deployment GPUs
- PTX fallback for future-compatible targets

## Why Compatibility Breaks

Typical mismatch classes:

- runtime-toolkit vs driver capability mismatch
- missing arch target in build flags
- ABI or dependency mismatch in host integration

Treat compatibility as part of release engineering, not a last-minute fix.

## NVCC Arch Hygiene

Use explicit arch targets and document them in build config.

- keep `-gencode` matrix aligned with actual fleet GPUs
- avoid shipping only one narrow arch unless environment is fixed

## Runtime/Driver Considerations

- new toolkits can require minimum driver versions
- deployment systems may lag driver updates

Validate on representative driver/toolkit combinations before release.

## Package-Level Practices

- pin toolkit version in CI
- record compile flags in build metadata
- verify cold-start JIT overhead if PTX fallback is expected
- add smoke tests per target GPU class

## Related Topics

- Error handling and debug build: `../error-handling-and-debug-build/DOC.md`
- Runtime API overview: `../runtime/DOC.md`
- PTX ISA overview: `../ptx/DOC.md`

## Official Source Links (Fact Check)

- NVCC Compiler Driver documentation: https://docs.nvidia.com/cuda/cuda-compiler-driver-nvcc/index.html
- CUDA Compatibility documentation: https://docs.nvidia.com/deploy/cuda-compatibility/index.html
- CUDA Installation Guide (version/driver context): https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html

Last cross-check date: 2026-03-20
