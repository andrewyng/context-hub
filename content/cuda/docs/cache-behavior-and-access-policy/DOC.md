---
name: cache-behavior-and-access-policy
description: "CUDA cache-behavior essentials: locality patterns, read-only paths, L2 persistence windows, and access-policy tradeoffs."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,cache,l2,access-policy,persistence-window,read-only-cache,locality,stream-attributes"
---

# CUDA Cache Behavior And Access Policy (C++)

Use this page when kernels are bandwidth-limited and cache behavior is the next bottleneck.

## First Principle

No cache hint compensates for fundamentally poor locality.

Always fix:

- coalescing
- reuse distance
- working set shape

before tuning cache policy knobs.

## Read-Only And Locality-Aware Access

Read-only paths and locality-aware layouts can reduce memory traffic pressure.

- group neighboring accesses by neighboring threads
- avoid random scatter in the hottest loops
- keep reused regions compact when possible

## L2 Access Policy Window

CUDA exposes stream-level access-policy controls for L2 persistence behavior.

- set stream attributes for persistence windows
- use them only for demonstrably reused regions
- tune hit ratio assumptions carefully

Overusing persistence windows can hurt other traffic and reduce global efficiency.

## Practical Workflow

1. identify hotspot kernels.
2. confirm memory-bound behavior with profiling.
3. improve layout/coalescing first.
4. test cache/access-policy changes incrementally.
5. keep only changes that improve end-to-end latency.

## Common Pitfalls

- setting cache policy globally without per-kernel evidence
- treating cache hints as deterministic guarantees
- ignoring multi-stream interference in shared cache resources

## Related Topics

- Coalescing: `../coalescing/DOC.md`
- Data layout and alignment: `../data-layout-and-alignment/DOC.md`
- Streams and events: `../streams-and-events/DOC.md`
- Performance debugging: `../performance-debugging/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Programming Guide, L2 persistence/access-policy window APIs: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html
- CUDA C++ Best Practices Guide, memory-system optimization context: https://docs.nvidia.com/cuda/archive/13.0.0/cuda-c-best-practices-guide/index.html

Last cross-check date: 2026-03-20
