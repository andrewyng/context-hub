---
name: cute-layout-and-tensor-primer
description: "CUTLASS 3.x / CuTe core abstractions: Layouts (Shape + Stride hierarchy), Tensors, and mappings to TMA / WGMMA instructions."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-22"
  source: official
  tags: "cuda,cpp,cute,cutlass,layout,tensor,hopper,sm90,blackwell,sm100,wgmma,tma"
---

# CuTe Layout and Tensor Primer (C++)

Use this page to understand `CuTe` (the core abstraction engine behind CUTLASS 3.x/4.x), which is the modern standard for writing Hopper (SM90) and Blackwell (SM100) kernels. 

## The Abstraction Gap

Writing bare PTX (`wgmma`, `cp.async.bulk`) or relying purely on `nvcuda::wmma` creates brittle code when moving between tile shapes or architectures. 

CuTe solves this using algebraic concepts:
- **Layout:** A function mapping a logical multidimensional index (Shape) to a 1D physical offset (Stride).
- **Tensor:** A Memory Pointer coupled with a `Layout`.

## Core Mechanics

### 1. Hierarchical Shapes and Strides
In CuTe, shapes and strides are represented as `std::tuple`-like nested integers.
`Layout<Shape<_4, _8>, Stride<_8, _1>>` describes a $4 \times 8$ row-major matrix.

Because these are often compile-time constants (e.g., `_4`), the compiler aggressively optimizes the index algebra into bit-shifts and fast ALUs, eliminating integer modulo/division overhead in the inner loop.

### 2. Tensors Everywhere
Everything in CuTe is a Tensor: global memory arrays, shared memory buffers, and even registers. By mapping a `Layout` to a register array, CuTe abstracts away the opaque "fragment" problem of `wmma`.

```cpp
using namespace cute;
// Define a register tensor for the accumulator
Tensor acc = make_tensor<float>(Shape<_16, _16>{});
```

## Mapping to Hardware Instructions

Hardware like TMA (Tensor Memory Accelerator) and WGMMA natively expect extremely specific memory alignments, strides, and thread-to-data distributions.

CuTe bridges this via **TiledCopy** and **TiledMMA**:
- A `TiledCopy` takes a hardware capability (e.g., `SM90_TMA_LOAD`) and applies it to a layout.
- A `TiledMMA` takes a hardware capability (e.g., `SM90_64x64x16_F16F16F16F16_TN`) and defines how a thread block iterates over a larger algorithmic tile.

## Why Agents Should Emit CuTe

When automatically generating high-performance kernels, emitting CuTe C++ code is generally superior to emitting pure PTX:
1. CuTe handles the register coalescing and shared memory bank-conflict avoidance automatically through Swizzle templates.
2. It compiles down to the exact same SASS output as perfectly hand-tuned PTX.
3. Provides forward compatibility with newer SM architectures.

## Related Topics

- PTX WGMMA: `../ptx/instructions/wgmma/DOC.md`
- PTX TMA: `../ptx/instructions/tma/DOC.md`
- Tensor Core pipeline patterns: `../tensor-core-pipeline-patterns/DOC.md`

## Official Source Links (Fact Check)

- CUTLASS 3.0 CuTe Documentation: https://github.com/NVIDIA/cutlass/tree/main/media/docs/cute
- GTC 2023 CuTe Tutorial: https://github.com/NVIDIA/cutlass/tree/main/examples/cute/tutorial

Last cross-check date: 2026-03-22
