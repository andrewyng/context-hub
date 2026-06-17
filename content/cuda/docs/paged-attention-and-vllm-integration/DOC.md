---
name: paged-attention-and-vllm-integration
description: "Paged attention kernel patterns: irregular memory management, KV cache block tables, and integration with dynamic batching systems."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-22"
  source: official
  tags: "cuda,gpu,kernel,paged-attention,vllm,kv-cache,block-tables,llm,dynamic-batching,sparse-memory"
---

# Paged Attention and vLLM Integration (C++)

Use this page when writing attention kernels that deal with non-contiguous Key-Value (KV) cache memory.

## The Memory Fragmentation Problem

In generative LLM inference, keeping the KV cache in contiguous global memory leads to severe fragmentation and waste due to variable sequence lengths and unknown generation lengths. 

Paged Attention solves this by partitioning the KV cache into fixed-size "blocks" (pages) distributed irregularly in memory, mimicking OS virtual memory.

## Core Architectural Differences

Instead of addressing $K[b, h, seq, d]$, paged attention kernels require an indirection layer:
- **Block Table:** An array of pointers or physical block indices. `block_table[b, logical_block_idx] -> physical_block_idx`.
- **Physical KV Cache:** A pre-allocated memory pool of shape `[num_physical_blocks, block_size, num_heads, head_size]`.

## Pointers vs Indices

During the inner loop of the FlashAttention-style GEMM, the kernel must fetch $K$ and $V$ tiles.
- **Contiguous:** `k_ptr = k_base + stride * idx`
- **Paged:** 
  1. Determine `logical_block = seq_idx / block_size`
  2. Map to `physical_block = block_table[logical_block]`
  3. Load from `physical_kv_pool + physical_block_stride + local_offset`

*Warning:* Performing this modular math or indirection randomly inside a tight inner loop causes severe instruction pipeline stalls. The index calculation must be done warp-uniformly and scheduled outside the core MMA pipeline if possible.

## TMA Compatibility Challenges

Hardware Tensor Memory Accelerator (TMA) typically assumes contiguous, standard-stride tensors. TMA fetching across block boundaries in a paged KV cache is non-trivial.
- If $K$ tile spans a page boundary, two TMA descriptors/requests might be necessary.
- **Mitigation:** Ensure the block size is an integer multiple of the MMA tile size along the sequence dimension (e.g., $N=64$). This guarantees a fetched tile is physically contiguous.

## Prefix Sharing and Radix Attention

Paged attention naturally enables memory sharing (e.g., prompt sharing across multiple parallel generations).
- The `block_table` for different sequences can simply point to the same `physical_block`.
- Since KV cache memory is read-only during the generation phase for existing tokens, no special hardware locks are needed.

## Related Topics

- Flash Attention patterns: `../flash-attention-implementation-patterns/DOC.md`
- Sparse and irregular kernels: `../sparse-and-irregular-kernels/DOC.md`
- Asynchronous copies: `../async-copy/DOC.md`

## Official Source Links (Fact Check)

- vLLM Project Documentation: https://vllm.readthedocs.io/
- PagedAttention Paper (vLLM): https://arxiv.org/abs/2309.06180

Last cross-check date: 2026-03-22
