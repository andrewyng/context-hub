---
name: flash-attention-implementation-patterns
description: "FlashAttention design patterns: online softmax scaling, SRAM-aware tiling, causality masking, and recomputation techniques."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-22"
  source: official
  tags: "cuda,gpu,kernel,flash-attention,attention,online-softmax,tiling,shared-memory,recomputation,gemm"
---

# Flash Attention Implementation Patterns (C++)

Use this page as a structural guide to implementing exact, memory-efficient attention operations (FlashAttention-style) in CUDA.

## The Memory Bottleneck in Attention

Standard attention materializes the $N \times N$ attention matrix $S = QK^T$ in global memory. For large sequence lengths $N$, the global-memory traffic of writing and reading $S$ outweighs the arithmetic cost.

FlashAttention keeps the intermediate $S$ and $P = \text{softmax}(S)$ entirely within shared memory (SRAM), drastically cutting memory bandwidth requirements.

## Online Softmax Formulation

To compute the softmax without scanning the entire row of $S$ at once (which exceeds shared memory capacity), you must use the online safe softmax trick:

- Track the running block maximum: $m_{\text{new}} = \max(m_{\text{old}}, \max(S_{\text{block}}))$
- Track the running denominator: $l_{\text{new}} = l_{\text{old}} \cdot e^{m_{\text{old}} - m_{\text{new}}} + \sum e^{S_{\text{block}} - m_{\text{new}}}$
- Rescale the running output accumulator $O$ when the maximum changes.

## Double GEMM Pipeline

A standard FlashAttention block does:

1. **GEMM 1:** Load a tile of $Q$ and a tile of $K$. Compute tile of $S = QK^T$.
2. **Masking & Scaling:** Apply causal masks and scale by $1/\sqrt{d}$.
3. **Softmax:** Update running online softmax metrics ($m, l$). Compute tile of $P = e^{S - m_{new}}$.
4. **GEMM 2:** Load a tile of $V$. Compute $O = O \cdot \text{scale} + P V$.

Both GEMM operations involve the accumulator in registers/shared memory.

## SRAM Layout and Occupancy

The primary constraint is shared memory size:
- You must fit tiles of $Q$, $K$, and $V$ in shared memory.
- $Q$ usually stays resident in the outer loop, while $K$ and $V$ stream through the inner loop.
- To maintain sufficient warp occupancy, optimize tile sizes (e.g., $128 \times 64$ or $64 \times 128$) to leave room for at least 2 thread blocks per SM.

## Recomputation on the Backward Pass

Instead of saving the massive $S$ or $P$ matrices for the backward pass, FlashAttention recalculates them during the backward kernel.
- State saved to global memory: only the softmax normalization constants (Log-Sum-Exp, $L$) and output $O$.
- During backward evaluation, knowing $L$ allows exact re-derivation of $P$ using only the query/key memory bandwidth.

## Thread-block and Warp Assignment

- Assign the sequence dimension of $Q$ across thread blocks.
- Within a block, parallelize the computation of $QK^T$ rows across warps.
- Use the `mma.sync` or `wgmma` PTX paths for the heavy matrix multiplications.

## Related Topics

- Shared memory layout: `../shared-memory/DOC.md`
- Tensor Core pipeline patterns: `../tensor-core-pipeline-patterns/DOC.md`
- PTX WGMMA: `../ptx/instructions/wgmma/DOC.md`
- Paged attention: `../paged-attention-and-vllm-integration/DOC.md`

## Official Source Links (Fact Check)

- FlashAttention Original Paper / Algorithm: https://arxiv.org/abs/2205.14135
- FlashAttention-2 Algorithm: https://arxiv.org/abs/2307.08691

Last cross-check date: 2026-03-22
