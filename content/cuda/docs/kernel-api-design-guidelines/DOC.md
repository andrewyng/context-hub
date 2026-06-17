---
name: kernel-api-design-guidelines
description: "CUDA kernel API design essentials: parameter contracts, shape/stride conventions, launch invariants, and forward-compatible interface choices."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,api-design,shape,stride,contracts,launch-invariants,interface,maintainability"
---

# CUDA Kernel API Design Guidelines (C++)

Use this page when defining or refactoring kernel-facing interfaces for long-term maintainability.

## Interface Contracts First

Document and enforce:

- tensor shape expectations
- stride/layout assumptions
- alignment requirements
- supported dtype/precision combinations

Unstated assumptions become production bugs.

## Parameter Design

Prefer explicit parameters over hidden globals:

- dimensions (`n`, `h`, `w`, etc.)
- leading dimensions/strides
- flags that affect algorithmic paths

Keep argument ordering stable and predictable across related kernels.

## Launch Invariants

Define launch invariants close to API:

- valid block size range
- shared-memory requirements
- grid coverage model

Validate invariants early in host code where possible.

## Versioning Mindset

If a kernel API is reused across modules:

- avoid breaking parameter semantics silently
- add new fields/options in backward-compatible ways
- keep deprecation path explicit

## Related Topics

- Data layout and alignment: `../data-layout-and-alignment/DOC.md`
- Build and ABI compatibility: `../build-and-abi-compatibility/DOC.md`
- Regression testing and CI: `../regression-testing-and-ci/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Programming Guide, kernel launch and execution model background: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html
- CUDA C++ Best Practices Guide, software design and optimization workflow context: https://docs.nvidia.com/cuda/archive/13.0.0/cuda-c-best-practices-guide/index.html

Last cross-check date: 2026-03-20
