---
name: rope-and-fused-embeddings
description: "Rotary Position Embedding (RoPE) and fused projection kernels: memory-bound optimizations, complex arithmetic, and inplace updates."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-22"
  source: official
  tags: "cuda,gpu,kernel,rope,positional-encoding,embeddings,fused-kernel,llama,math"
---

# RoPE and Fused Embeddings (C++)

Use this page when implementing Rotary Position Embeddings (RoPE), the standard absolute/relative positional encoding scheme used in modern LLMs (e.g., LLaMA, Mistral).

## The Math and Memory Challenge

RoPE rotates pairs of elements in the Query ($Q$) and Key ($K$) vectors by an angle dependent on the position in the sequence and the channel dimension. 

$q_0' = q_0 \cos \theta - q_1 \sin \theta$
$q_1' = q_1 \cos \theta + q_0 \sin \theta$

Because this operation is purely pointwise (O(N) data, O(N) math), it is strictly **memory-bound**.

## Kernel Fusion: The Golden Rule

**Anti-Pattern:** 
1. Launch GEMM to compute $Q, K, V$. (Writes to memory)
2. Launch RoPE Kernel to apply rotations. (Reads from memory, computes $\sin/\cos$, writes to memory).
3. Launch FlashAttention. (Reads from memory).

**Best Practice:**
Fuse RoPE directly into the pipeline! There are two main approaches:

### Approach A: Epilogue Fusion (Recommended)
Fuse RoPE into the epilogue of the Linear Projection ($X \times W_{qkv}$).
As the thread block computes the final tile of $Q$ and $K$ in shared memory/registers, apply the rotation *before* storing it to global memory.

### Approach B: Prologue Fusion (Flash Attention)
If modifying the GEMM is difficult, load $Q$ and $K$ into FlashAttention, and apply the $\sin/\cos$ rotation immediately after fetching them into registers/SRAM, just before issuing the `mma.sync`.

## Mathematical Fast-Paths

Computing `sin()` and `cos()` via standard math libraries is extremely slow inside a tight kernel.

**Optimization 1: Precomputed $\sin/\cos$ Caches**
Allocate a small `[max_seq_len, head_dim / 2]` table in global memory containing the pre-computed frequencies.
- Load the precomputed values alongside the variables.
- The memory bandwidth cost of loading a small 1D cache is drastically outweighed by saving hundreds of ALU trig cycles.

**Optimization 2: Complex Arithmetic**
RoPE can be modeled as complex number multiplication. If your input data is `FP16` or `BF16`, treat adjacent pairs as a `float2` or `__half2` struct.
- Fetch `__half2` via 32-bit `LDG.32` instructions to halve memory instructions.
- Execute vectorized FMAs (Fused Multiply-Adds).

## In-place vs Out-of-place

Since $q'$ only depends on $q$, RoPE can be executed entirely **in-place** to save VRAM footprint during inference.

Ensure your grid mapping maps thread block `x` to contiguous elements of the head dimension to maintain perfect coalescing on 128-byte boundaries when writing back.

## Related Topics

- Coalescing: `../coalescing/DOC.md`
- Fused kernel design patterns: `../fused-kernel-design-patterns/DOC.md`
- Numerics and precision: `../numerics-and-precision/DOC.md`

## Official Source Links (Fact Check)

- RoFormer (Original RoPE Paper): https://arxiv.org/abs/2104.09864
- LLaMA implementation details (Meta): https://github.com/facebookresearch/llama
- CUDA Math API (Vectorized routines): https://docs.nvidia.com/cuda/cuda-math-api/cuda_math_api/group__CUDA__MATH__INTRINSIC__HALF.html

Last cross-check date: 2026-03-22
