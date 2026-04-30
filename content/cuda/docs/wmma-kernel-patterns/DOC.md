---
name: wmma-kernel-patterns
description: "Practical WMMA kernel patterns: warp-to-tile mapping, fragment loading rules, accumulator handling, and common failure modes."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,wmma,tensor-core,tensorcore,nvcuda::wmma,warp-matrix-multiply-accumulate,warp-mma,matrix-multiply-accumulate,fragment,mma_sync,load_matrix_sync,store_matrix_sync,gemm"
---

# WMMA Kernel Patterns (C++)

Use this page when you need a practical implementation pattern for `nvcuda::wmma`, not just API names.

## Warp-To-Tile Mapping

The baseline mapping is one warp per output tile:

- one warp loads A/B tile fragments
- one warp keeps the accumulator fragment
- one warp stores results back

Scale to larger problems by assigning multiple warps per block and iterating over K tiles.

## Minimal Pattern Skeleton

```cpp
using namespace nvcuda;

__global__ void wmma_gemm_kernel(const half* A, const half* B, float* C,
                                 int M, int N, int K,
                                 int lda, int ldb, int ldc) {
  int warp_id_in_block = threadIdx.x / 32;
  int lane_id = threadIdx.x % 32;

  int warp_m = (blockIdx.y * (blockDim.x / 32) + warp_id_in_block);
  int warp_n = blockIdx.x;

  if (warp_m * 16 >= M || warp_n * 16 >= N) return;

  wmma::fragment<wmma::accumulator, 16, 16, 16, float> c_frag;
  wmma::fill_fragment(c_frag, 0.0f);

  for (int k0 = 0; k0 < K; k0 += 16) {
    wmma::fragment<wmma::matrix_a, 16, 16, 16, half, wmma::row_major> a_frag;
    wmma::fragment<wmma::matrix_b, 16, 16, 16, half, wmma::col_major> b_frag;

    const half* a_ptr = A + (warp_m * 16) * lda + k0;
    const half* b_ptr = B + k0 * ldb + (warp_n * 16);

    wmma::load_matrix_sync(a_frag, a_ptr, lda);
    wmma::load_matrix_sync(b_frag, b_ptr, ldb);
    wmma::mma_sync(c_frag, a_frag, b_frag, c_frag);
  }

  float* c_ptr = C + (warp_m * 16) * ldc + (warp_n * 16);
  wmma::store_matrix_sync(c_ptr, c_frag, ldc, wmma::mem_row_major);
}
```

This skeleton is intentionally simple. Production kernels usually add shared-memory staging and pipelining.

## Critical Correctness Rules

- All lanes in the warp must execute the WMMA calls with consistent arguments.
- Layout and leading-dimension parameters must match fragment template expectations.
- Pointer alignment and stride constraints for load/store must satisfy API requirements.
- Fragment internal lane mapping is opaque; do not index fragment storage with custom lane assumptions.

## High-Value Performance Patterns

- Stage A/B tiles in shared memory to reduce uncoalesced global traffic.
- Use double-buffered tile staging when K is large.
- Keep one accumulator fragment alive across K-loop iterations.
- Control register pressure before adding heavy unrolling.

## Common Failure Modes

- Wrong `row_major`/`col_major` choice for multiplicands.
- Incorrect `lda`/`ldb`/`ldc` in element units.
- Partial-warp execution due to guard branches around WMMA calls.
- Correct output with low speed because data movement dominates MMA throughput.

## Verification Workflow

1. Compare numerics against a trusted GEMM baseline.
2. Confirm matrix instruction activity in profiler output.
3. Confirm shared-memory staging efficiency and low bank-conflict pressure.
4. Sweep block-level warp count and K-step scheduling for throughput.

## Related Topics

- Tensor Core overview: `../tensor-cores/DOC.md`
- Tensor Core pipeline patterns: `../tensor-core-pipeline-patterns/DOC.md`
- Shared memory: `../shared-memory/DOC.md`
- Async copy: `../async-copy/DOC.md`
- Numerics and precision: `../numerics-and-precision/DOC.md`
- PTX WGMMA: `../ptx/instructions/wgmma/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Programming Guide, WMMA API: https://docs.nvidia.com/cuda/cuda-c-programming-guide/
- CUDA C++ Programming Guide, Tensor Core usage restrictions: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html

Last cross-check date: 2026-03-20
