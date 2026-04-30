---
name: persistent-kernels-and-work-queues
description: "CUDA persistent-kernel essentials: resident worker model, device work queues, load balancing, and synchronization hazards."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,persistent-kernel,work-queue,load-balancing,atomics,producer-consumer,latency"
---

# CUDA Persistent Kernels And Work Queues (C++)

Use this page for latency-sensitive or irregular workloads where one long-lived kernel processes dynamic work.

## Persistent Kernel Model

A persistent kernel keeps a fixed set of resident blocks/warps alive and repeatedly pulls tasks from a queue.

This can reduce launch overhead and improve responsiveness for fine-grained dynamic work.

## Typical Components

- global/device work queue
- atomic enqueue/dequeue indices
- worker loop with termination protocol
- backoff or batching strategy for queue contention

## Where It Helps

- irregular task sizes
- real-time/low-latency pipelines
- workloads where kernel launch overhead is a large fraction of runtime

## Where It Hurts

- queue contention hotspots
- heavy atomic traffic
- poor fairness or starvation in naive dequeue policies
- over-occupying resources and blocking other kernels

## Design Guardrails

1. define clear producer/consumer ordering rules.
2. minimize global atomics per task (batch when possible).
3. bound queue contention with per-block or per-warp staging.
4. profile fairness and tail latency, not only average throughput.

## Related Topics

- Sparse and irregular kernels: `../sparse-and-irregular-kernels/DOC.md`
- Atomics and reductions: `../atomics-and-reductions/DOC.md`
- Memory fences and ordering: `../memory-fences-and-ordering/DOC.md`
- Streams/events and graphs: `../streams-and-events/DOC.md`, `../cuda-graphs/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Programming Guide, synchronization/order primitives used by queue-based designs: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html
- CUDA C++ Best Practices Guide, launch overhead and memory/atomic considerations: https://docs.nvidia.com/cuda/archive/13.0.0/cuda-c-best-practices-guide/index.html

Last cross-check date: 2026-03-20
