---
name: data-layout-and-alignment
description: "CUDA data-layout and alignment essentials: struct packing, vectorized loads/stores, pitch/stride choices, and alignment-driven performance."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,data-layout,alignment,vectorized-load,vectorized-store,pitch,stride,coalescing"
---

# CUDA Data Layout And Alignment (C++)

Use this page when kernel performance depends on memory layout details.

## Why Layout Matters

On CUDA GPUs, layout affects:

- coalescing behavior
- transaction count
- shared-memory bank behavior
- feasibility of vectorized loads/stores

Poor layout can dominate runtime even when arithmetic is optimized.

## Alignment Basics

Prefer natural alignment for data types and vectorized access.

- align pointers and base addresses to vector width
- keep struct fields ordered to reduce padding surprises
- avoid accidental misalignment from custom allocators or byte offsets

## AoS vs SoA

For many throughput-oriented kernels:

- SoA (structure of arrays) is often better for coalesced parallel access
- AoS (array of structs) can be easier semantically but may scatter accessed fields

Choose based on the access pattern of active threads, not only code convenience.

## Vectorized Access

Vectorized loads/stores (`float2`, `float4`, etc.) are useful when:

- data is aligned to the vector width
- adjacent threads follow contiguous access
- vectorization does not introduce awkward tail handling overhead

Always verify achieved bandwidth after vectorization; assumptions are often wrong.

## 2D Layouts

For 2D tensors/arrays:

- row-major contiguous row access is usually easiest to coalesce
- use pitched allocation when row width alignment is problematic
- treat logical shape and physical stride as separate concepts in APIs

## Common Pitfalls

- hidden misalignment from packed/byte-offset structs
- mixing row-major assumptions with column-oriented access
- forcing vectorized access on unaligned data

## Related Topics

- Coalescing: `../coalescing/DOC.md`
- Shared memory: `../shared-memory/DOC.md`
- Memory hierarchy: `../memory-hierarchy/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Best Practices Guide, memory access patterns and alignment context: https://docs.nvidia.com/cuda/archive/13.0.0/cuda-c-best-practices-guide/index.html
- CUDA C++ Programming Guide, memory model and type/layout background: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html

Last cross-check date: 2026-03-20
