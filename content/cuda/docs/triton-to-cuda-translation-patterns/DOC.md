---
name: triton-to-cuda-translation-patterns
description: "Translation patterns from OpenAI Triton to explicit CUDA C++: block pointers to TMA, mask unrolling to predicates, and tl.dot to WGMMA/CuTe."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-22"
  source: official
  tags: "cuda,triton,cpp,translation,compiler,tma,wgmma,tl-dot,tl-load,agent,generation"
---

# Triton to CUDA Translation Patterns

Use this page to guide the manual or agent-assisted conversion of an OpenAI Triton script into raw, highly-optimized CUDA C++ (using CuTe/PTX). 

While Triton is excellent for rapid prototyping, native CUDA C++ often still provides 10-20% extra performance for highly specialized hardware paths (like explicit `mbarrier` multi-stage pipelines or mixed-precision W4A16 decoding).

## Core Mapping Dictionary

When rewriting Triton semantics into CUDA, follow these mappings:

### 1. `tl.arange` and Block Offsets
- **Triton:** `pid = tl.program_id(0); offsets = pid * BLOCK_SIZE + tl.arange(0, BLOCK_SIZE)`
- **CUDA/CuTe:** Rely on `make_coord` and CuTe Tensors. Map the `blockIdx.x` to the outermost step of the tile structure.

### 2. `tl.load` and Masking
- **Triton:** `tl.load(ptr + offsets, mask=offsets < MAX, other=0.0)`
- **CUDA (Pre-Hopper):** Requires predicated load loops. `if (idx < MAX) { reg = ptr[idx]; } else { reg = 0.0; }`
- **CUDA (Hopper/SM90+):** Replace entirely with **TMA (Tensor Memory Accelerator)**. TMA natively handles out-of-bounds masking in hardware. Set up the `CUtensorMap` on the host, and execute `cp.async.bulk` in the kernel without any explicit branch masking.

### 3. `tl.dot` (Matrix Multiplication)
- **Triton:** `tl.dot(a, b, acc, out_dtype=tl.float32)`
- **CUDA:** 
  - For standard Ampere (SM80): Map to `nvcuda::wmma::mma_sync`.
  - For Hopper (SM90+): Map to CuTe's `gemm()` API or raw `wgmma.mma_async`.

### 4. `tl.make_block_ptr`
- **Triton:** Uses block pointers for advanced 2D fetching and hardware accelerated load/stores.
- **CUDA:** This translates exactly to creating a CuTe `Tensor` over a physical pointer with a multi-dimensional `Layout`, specifically using `make_tma_copy` to leverage `SM90_TMA_LOAD`.

## Dealing with Shared Memory (`tl.tensor` inside loops)

Triton implicitly allocates shared memory behind the scenes when a tensor is used to carry state across loops (e.g., intermediate tiles inside a GEMM macro-loop). 
- **In CUDA:** You must explicitly allocate `__shared__` memory.
- You must handle the Pipeline / Double Buffering yourself using explicit `__syncthreads()` or `#pragma unroll` with `cp.async.commit_group` / `cp.async.wait_group`.

## Why Translate to CUDA?

1. **Host-Side Overheads:** Triton's Python runtime can inject launch overheads. Native C++ CUDA integrated into PyTorch via Pybind11 offers the lowest possible latency for decoding.
2. **Explicit Bank Conflicts:** Triton generally does a good job via Swizzle layouts, but highly irregular access patterns (like RoPE or custom MoE routing) allow you to explicitly manage `[row, col]` XOR swizzling in CuTe exactly the way you need to avoid shared memory bank conflicts.

## Related Topics

- CuTe Layout and Tensor Primer: `../cute-layout-and-tensor-primer/DOC.md`
- TMA Bulk Copy: `../tma-bulk-copy-and-multicast/DOC.md`
- Tensor Core pipeline patterns: `../tensor-core-pipeline-patterns/DOC.md`

## Official Source Links (Fact Check)

- OpenAI Triton Language Reference: https://triton-lang.org/main/programming-guide/chapter-1/introduction.html
- CUTLASS 3.x / CuTe translation conceptual mappings: https://github.com/NVIDIA/cutlass/tree/main/media/docs

Last cross-check date: 2026-03-22
