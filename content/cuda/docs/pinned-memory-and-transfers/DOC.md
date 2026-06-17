---
name: pinned-memory-and-transfers
description: "CUDA pinned-memory and transfer essentials: page-locked host memory, async memcpy overlap, and transfer-path tuning."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,pinned-memory,page-locked,cudaHostAlloc,cudaMemcpyAsync,transfer-overlap,pcie"
---

# CUDA Pinned Memory And Transfers (C++)

Use this page when host-device transfer performance or overlap is a bottleneck.

## What Pinned Memory Is

Pinned (page-locked) host memory is allocated with APIs such as:

- `cudaHostAlloc`
- `cudaMallocHost`

Because it is page-locked, the runtime can perform faster and more predictable DMA transfers.

## Why It Matters

`cudaMemcpyAsync` overlap with kernel execution generally requires:

- non-default stream usage
- pinned host buffers for transfer endpoints

Without pinned memory, many async-copy scenarios degrade to serialized behavior.

## Basic Pattern

1. allocate pinned host buffers
2. launch `cudaMemcpyAsync(..., stream)`
3. launch kernels in suitable streams
4. synchronize with stream/event primitives, not global device sync

## Tradeoffs

- pinned memory improves transfer behavior
- but excessive pinning can hurt overall system memory behavior on the host

Pin only hot buffers and reuse them.

## Common Mistakes

- assuming `cudaMemcpyAsync` always overlaps without checking buffer type
- mixing default-stream semantics and expecting full concurrency
- over-allocating pinned memory globally

## Related Topics

- Streams and events: `../streams-and-events/DOC.md`
- Unified Memory: `../unified-memory/DOC.md`
- CUDA Graphs: `../cuda-graphs/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Best Practices Guide, host-device transfer optimization: https://docs.nvidia.com/cuda/archive/13.0.0/cuda-c-best-practices-guide/index.html
- CUDA Runtime API, host-memory management and async memcpy: https://docs.nvidia.com/cuda/cuda-runtime-api/index.html

Last cross-check date: 2026-03-20
