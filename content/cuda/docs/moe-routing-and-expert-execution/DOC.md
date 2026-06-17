---
name: moe-routing-and-expert-execution
description: "Mixture of Experts (MoE) kernel patterns: token routing, prefix sums, contiguous memory repacking, and batched expert GEMMs."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-22"
  source: official
  tags: "cuda,gpu,kernel,moe,mixture-of-experts,routing,radix-sort,prefix-sum,grouped-gemm,scatter-gather"
---

# Mixture of Experts (MoE) Routing and Execution

Use this page when designing kernels for Mixture of Experts (MoE) architectures, which are characterized by dynamic control flow and extreme memory irregularity (e.g., Mixtral, DeepSeek).

## The MoE Irregularity Problem

In a dense MLP layer, all tokens in a batch hit the same linear weight matrices.
In an MoE MLP layer, a router (gate) assigns each token to 1 or 2 (or more) "Experts" out of $E$ possible experts. 

If executed naively, each expert does a tiny GEMM on non-contiguous tokens scattered across the batch. This shatters memory coalescing and leaves SMs starved.

## Phase 1: The Routing / Sorting Kernel

Before doing the math, tokens must be physically regrouped:
1. **Gate Evaluation:** Compute `softmax(X * W_gate)` to get expert probabilities.
2. **Top-K Selection:** Select the top $K$ experts and their routing weights.
3. **Prefix Sum (Scan):** Use a fast parallel prefix sum (e.g., via CUB) to count how many tokens go to each expert and compute their target offsets.
4. **Scatter/Repack:** Move the token activation vectors from their original batch position into a new contiguous buffer where all tokens for Expert 0 are laid out together, followed by Expert 1, etc.

## Phase 2: Grouped GEMM / Batched Execution

Once tokens are contiguous per expert, the math becomes a **Grouped GEMM**.
Instead of launching $E$ separate small GEMM kernels (which causes severe launch overhead), you launch a single Grouped GEMM kernel (or use `cublasLtGroupedGemm`).

- **Block Assignment:** The kernel reads an array of "problem sizes" (how many tokens each expert received). Thread blocks are assigned dynamically to expert chunks.
- **Tail Effects:** If Expert 2 receives 3 tokens and the Block Tile size is 64, compute utilization is terrible. Highly optimized MoE kernels (like Megatron-LM or vLLM's custom kernels) implement "Continuous Batching" or "Marlin-style" techniques to pack uneven segments across thread blocks tightly.

## Dealing with Dropped Tokens & Padding

In training or strict capacity routing, an expert has a maximum capacity $C$.
- If an expert is oversubscribed, tokens are "dropped" (zeroed out or routed to the next best layer).
- The routing kernel must safely truncate writes using atomic operations or masked prefix sums to avoid out-of-bounds memory corruption.

## Related Topics

- Sparse and irregular kernels: `../sparse-and-irregular-kernels/DOC.md`
- Fused kernel design patterns: `../fused-kernel-design-patterns/DOC.md`
- Paged attention (for dynamic memory): `../paged-attention-and-vllm-integration/DOC.md`

## Official Source Links (Fact Check)

- NVIDIA Megatron-LM MoE Implementation Concepts: https://github.com/NVIDIA/Megatron-LM
- CUTLASS Grouped GEMM: https://github.com/NVIDIA/cutlass/tree/main/examples/24_gemm_grouped

Last cross-check date: 2026-03-22
