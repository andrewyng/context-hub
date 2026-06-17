---
name: speculative-decoding-tree-attention
description: "Speculative Decoding and Tree Attention kernel patterns: parallel verification, causal mask generation for trees, and batch positional offsets."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-22"
  source: official
  tags: "cuda,gpu,kernel,speculative-decoding,tree-attention,medusa,llm,decoding,verification"
---

# Speculative Decoding & Tree Attention (C++)

Use this page to write highly parallel verification kernels required for Speculative Decoding methods (e.g., Medusa, Lookahead Decoding, Eagle).

## The Speculative Decoding Paradigm

Instead of decoding 1 token at a time (pure memory bound GEMV), Speculative Decoding introduces a "Draft Model" or a specialized projection head that guesses the next $N$ tokens.
The main LLM must then **verify** these $N$ draft tokens in a single parallel forward pass.

This shifts the operation from a Batch-1 GEMV back toward a small-Batch GEMM, significantly improving GPU utilization.

## Tree Attention Mechanics

The draft tokens often form a tree of possibilities rather than a single sequence.
Instead of evaluating each branch separately, you construct a single batch of shape `[Tree_Nodes]`.

**The Kernel Challenge:**
A standard Causal Attention mask is a simple lower-triangular matrix.
In a Tree Attention verification kernel, the mask reflects the exact topology of the draft tree.
- Token $C$ only attends to Token $B$ if $B$ is a direct ancestor of $C$ in the draft tree.
- This requires passing an explicit boolean/integer adjacency matrix or ancestor depth mapping array into the Attention Kernel, rather than generating the mask procedurally via thread coordinates.

## Paged KV Cache Updates

During verification:
1. Fetch the existing context from the Paged KV Cache block table.
2. Evaluate the new $N$ tree nodes.
3. Identify the longest accepted path through the tree.
4. **Important:** Only append the *accepted* KV states into the persistent KV cache Block Table. Discard the KV states computed for the rejected branches.

This requires the KV cache write-back kernel to accept an array of `accepted_indices` indicating which subsets of the temporary $K$ and $V$ tensors should actually be committed to global memory.

## RoPE Positional Adjustments

In standard generation, the position offset is scalar (e.g., `pos = 101`).
In Tree Attention, because $N$ tokens are evaluated simultaneously and may have the same logical position in different branches, the kernel must ingest a `position_ids` array of shape `[N]` (e.g., `[101, 102, 102, 103, 103]`) and compute the RoPE rotation uniquely per token based on that array rather than block depth.

## Related Topics

- Flash Attention Implementation Patterns: `../flash-attention-implementation-patterns/DOC.md`
- Paged Attention and vLLM: `../paged-attention-and-vllm-integration/DOC.md`
- RoPE and Fused Embeddings: `../rope-and-fused-embeddings/DOC.md`

## Official Source Links (Fact Check)

- Speculative Decoding Paper: https://arxiv.org/abs/2211.17192
- Medusa: Simple LLM Inference Acceleration Framework: https://github.com/FasterDecoding/Medusa
- vLLM Architecture Specs: https://vllm.readthedocs.io/

Last cross-check date: 2026-03-22
