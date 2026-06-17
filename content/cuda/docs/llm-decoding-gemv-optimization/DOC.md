---
name: llm-decoding-gemv-optimization
description: "LLM Autoregressive decoding optimizations: Split-K GEMV, persistent thread blocks, and memory-bandwidth saturation techniques."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-22"
  source: official
  tags: "cuda,gpu,kernel,gemv,llm,decoding,split-k,autoregressive,persistent-kernel,memory-bound"
---

# LLM Decoding Phase Optimization (GEMV)

Use this page when optimizing the auto-regressive decoding phase of Large Language Models, which is fundamentally constrained by memory bandwidth rather than compute.

## GEMV vs. GEMM Mechanics

During the prefill phase (prompt processing), the operation is a GEMM (Matrix-Matrix), which is compute-bound. 
During the decoding phase (batch_size = 1), generating the next token is a GEMV (Matrix-Vector) operation.

- **GEMM Math:** $O = Q \cdot K^T$. Tensor Cores are fully utilized. 
- **GEMV Math:** $O = q \cdot K^T$. Tensor Cores may be severely underutilized. The SM spends most of its time waiting for $K$ and $V$ weights to arrive from global memory.

## The Under-Occupancy Problem

In a standard batch-size=1 GEMV, the computation might only launch enough thread blocks to cover the attention heads. On a GPU like the H100 with 132 SMs, launching only 32 thread blocks (for 32 heads) leaves 100 SMs completely idle.

## Split-K Optimization Strategy

To saturate the GPU, you must parallelize across the reduction dimension ($K$, representing the sequence length of the KV Cache).

**How it works:**
1. Split the KV cache sequence for a single head across multiple thread blocks (e.g., 4 blocks per head).
2. Each block computes a partial sum (vector dot product) for its slice of the sequence.
3. The partial sums are written to shared global workspace.
4. A final reduction step (using atomic adds or a subsequent lightweight kernel) aggregates the partial sums.

*Result:* $32 \text{ heads} \times 4 \text{ splits/head} = 128 \text{ blocks}$, successfully saturating the massive GPU footprint.

## Persistent Thread Blocks (Persistent Kernels)

Launching a new kernel for every single token being decoded introduces severe CPU launch overhead (often 2-5 microseconds per launch), which accumulates heavily across thousands of tokens.

**The Solution:**
Instead of returning control to the CPU after one token, the kernel uses a `while` loop that spins on a global memory flag.
- The GPU continuously polls a memory location to check if the next query vector is ready.
- Communication between layers happens entirely via NVLink / Global Memory, bypassing the CPU scheduler completely (often referred to as CUDA Graphs or Device Graphs).

## Related Topics

- Cooperative groups (useful for Split-K reductions): `../cooperative-groups/DOC.md`
- Fused kernel design patterns (epilogue fusion): `../fused-kernel-design-patterns/DOC.md`
- Paged attention and vLLM: `../paged-attention-and-vllm-integration/DOC.md`

## Official Source Links (Fact Check)

- NVIDIA TensorRT-LLM Documentation: https://nvidia.github.io/TensorRT-LLM/
- Persistent Kernels context: https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html

Last cross-check date: 2026-03-22
