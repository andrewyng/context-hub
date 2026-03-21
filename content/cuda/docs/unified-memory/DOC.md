---
name: unified-memory
description: "CUDA Unified Memory essentials: managed allocations, migration behavior, prefetch/advice, and common performance pitfalls."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,unified-memory,managed-memory,cudaMallocManaged,cudaMemPrefetchAsync,cudaMemAdvise,page-migration"
---

# CUDA Unified Memory (C++)

Use this page when you need a single pointer model across CPU and GPU with on-demand migration.

## Core API

Unified Memory is commonly allocated with:

- `cudaMallocManaged`

The runtime and driver can migrate pages between host and device as memory is accessed.

## Why It Helps

- simpler programming model for heterogeneous memory access
- easier incremental porting from CPU-oriented code
- fewer explicit memcpy calls in basic workflows

## Why It Can Be Slow

On-demand page migration can stall kernels if data is not resident on the device when accessed.

Symptoms:

- unpredictable first-touch latency
- page-fault-driven migration overhead
- lower effective bandwidth than explicit transfer pipelines

## Performance Controls

Use:

- `cudaMemPrefetchAsync` to place data near expected access
- `cudaMemAdvise` hints for access patterns and preferred location

These often reduce migration faults and smooth performance.

## When To Prefer Explicit Transfers

Prefer explicit host/device transfers when:

- access pattern is stable and predictable
- maximum throughput is required
- migration overhead dominates runtime

Unified Memory is often best for productivity first, then selectively optimized for hot paths.

## Related Topics

- Pinned memory and transfers: `../pinned-memory-and-transfers/DOC.md`
- Streams and events: `../streams-and-events/DOC.md`
- Performance debugging: `../performance-debugging/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Programming Guide, Unified Memory programming: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html
- CUDA Runtime API, managed-memory and memory-advice APIs: https://docs.nvidia.com/cuda/cuda-runtime-api/index.html

Last cross-check date: 2026-03-20
