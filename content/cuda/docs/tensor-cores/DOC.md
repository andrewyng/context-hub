---
name: tensor-cores
description: "CUDA Tensor Core essentials: WMMA fragments, load/store rules, mma_sync, and when to drop to PTX WGMMA."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 2
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,tensor-cores,tensor-core,tensorcore,wmma,nvcuda::wmma,warp-matrix-multiply-accumulate,warp-mma,load_matrix_sync,mma_sync,store_matrix_sync,wgmma,mma,matrix-multiply-accumulate,fragment"
---

# CUDA Tensor Cores (C++)

Use this page for the CUDA C++ API view of Tensor Cores. It is the correct first stop for `wmma` questions.

## Primary API Namespace

CUDA exposes the warp-level matrix API in `nvcuda::wmma`.

Core concepts:

- `wmma::fragment`
- `wmma::load_matrix_sync`
- `wmma::store_matrix_sync`
- `wmma::fill_fragment`
- `wmma::mma_sync`

All of these are warp-synchronous interfaces.

## Mental Model

Each warp collaborates on a matrix tile.

- matrix A and B tiles are loaded into fragments
- an accumulator fragment holds C / D
- `mma_sync` performs `D = A * B + C`
- results are written back with `store_matrix_sync`

## Minimal Workflow

```cpp
using namespace nvcuda;

wmma::fragment<wmma::matrix_a, 16, 16, 16, half, wmma::row_major> a_frag;
wmma::fragment<wmma::matrix_b, 16, 16, 16, half, wmma::col_major> b_frag;
wmma::fragment<wmma::accumulator, 16, 16, 16, float> c_frag;

wmma::fill_fragment(c_frag, 0.0f);
wmma::load_matrix_sync(a_frag, a_ptr, lda);
wmma::load_matrix_sync(b_frag, b_ptr, ldb);
wmma::mma_sync(c_frag, a_frag, b_frag, c_frag);
wmma::store_matrix_sync(d_ptr, c_frag, ldd, wmma::mem_row_major);
```

## Usage Rules

- all threads in the warp must participate
- `mptr`, `ldm`, layout, and template parameters must match across the warp
- memory pointers for matrix loads/stores must satisfy the documented alignment and leading-dimension requirements
- fragment element mapping across lanes is opaque; do not assume a stable per-lane layout

## Alignment And Stride Constraints

`load_matrix_sync` and `store_matrix_sync` have strict requirements.

- the pointer must meet the documented alignment requirement
- `ldm` must satisfy the documented stride constraint in elements
- all lanes in the warp must agree on the arguments

If these conditions are violated, behavior is undefined or performance will collapse around the staging path.

## Supported Types And Shapes

WMMA does not mean "any matrix multiply on Tensor Cores".

- only specific tile shapes are supported
- only specific multiplicand and accumulator type combinations are supported
- support varies by architecture and API subset

When the type / shape combination is outside the documented WMMA set, you either stay on the ordinary arithmetic path or move to a lower-level PTX path if the hardware and toolchain support it.

## Shared Memory Staging Is Common

High-performance Tensor Core kernels usually do more than call `mma_sync`.

Typical structure:

1. move tiles from global memory
2. stage or reorder them in shared memory if needed
3. load fragments
4. execute `mma_sync`
5. store accumulators back to memory

So Tensor Core performance is often gated by shared-memory layout, coalescing, and synchronization as much as by the MMA instruction itself.

## Restrictions That Matter

- fragment layout is architecture-specific
- passing fragments across separately compiled code for different architectures is unsafe
- if fragments must cross an interface boundary, store to memory first and pass ordinary pointers instead

## When WMMA Is The Right Layer

Stay with WMMA when:

- you are writing CUDA C++ kernels
- you want a supported high-level Tensor Core interface
- the problem maps naturally to documented WMMA tile shapes and types

Drop to PTX when:

- you need `wgmma`
- you need architecture-specific async MMA protocols
- you are working with TMA, mbarrier, or lower-level Hopper/Blackwell Tensor Core workflows

## WMMA vs "CUDA Core" Arithmetic

If a matrix multiply is written as ordinary nested scalar FMAs, it usually runs on the ordinary arithmetic path rather than the Tensor Core path.

To reliably target Tensor Cores from CUDA C++, use the documented WMMA interfaces or an equivalent library path that emits the required matrix instructions.

## Related Topics

- Execution model: `../execution-model/DOC.md`
- CUDA Core path: `../cuda-core/DOC.md`
- Compute throughput model: `../compute-throughput/DOC.md`
- Warp-level execution model: `../warp-primitives/DOC.md`
- Shared memory staging: `../shared-memory/DOC.md`
- WMMA practical patterns: `../wmma-kernel-patterns/DOC.md`
- WMMA debugging checklist: `../wmma-debugging-checklist/DOC.md`
- Tensor Core pipeline patterns: `../tensor-core-pipeline-patterns/DOC.md`
- Tensor Core numerical validation: `../tensor-core-numerical-validation/DOC.md`
- CUDA Core vs Tensor Core path selection: `../cuda-core-vs-tensor-core-path-selection/DOC.md`
- PTX WGMMA entry: `../ptx/instructions/wgmma/DOC.md`
- PTX TMA entry: `../ptx/instructions/tma/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Programming Guide, WMMA API and fragments: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html
- CUDA C++ Programming Guide, `load_matrix_sync` / `store_matrix_sync` / `mma_sync`: https://docs.nvidia.com/cuda/archive/9.1/cuda-c-programming-guide/index.html
- CUDA C++ Programming Guide, Tensor Core restrictions: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html

Last cross-check date: 2026-03-20
