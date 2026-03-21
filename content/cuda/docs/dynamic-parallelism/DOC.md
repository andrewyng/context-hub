---
name: dynamic-parallelism
description: "CUDA Dynamic Parallelism essentials: device-side kernel launch semantics, synchronization behavior, and memory-space constraints."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,dynamic-parallelism,cdp,device-side-launch,child-kernel,cudaDeviceSynchronize,memory-coherence"
---

# CUDA Dynamic Parallelism (C++)

Use this page when kernels launch other kernels on the device.

## What It Is

Dynamic Parallelism (CDP) lets device code launch child grids.

- parent and child execute on the device
- launch configuration is provided from device code
- useful for irregular recursion-like or adaptive decomposition patterns

## Core Semantics

- child launch is asynchronous with respect to the launching thread by default
- synchronization choices in parent code determine when child results are consumed
- launch overhead is non-trivial; avoid using CDP for tiny kernels in hot loops

## Memory-Space Coherence

Key memory-space rule from CUDA docs:

- parent and child share global/constant memory
- local and shared memory are private to their respective thread/block contexts

Do not assume parent shared memory is visible to child kernels.

## Typical Use Cases

- adaptive refinement
- irregular tree/graph traversal
- work generation discovered during device execution

For regular dense workloads, host-side launch or CUDA Graphs is usually better.

## Common Pitfalls

- launching too many tiny child kernels
- misunderstanding parent/child visibility boundaries
- relying on implicit ordering that is not guaranteed

## Related Topics

- CUDA Graphs: `../cuda-graphs/DOC.md`
- Streams and events: `../streams-and-events/DOC.md`
- Memory fences and ordering: `../memory-fences-and-ordering/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Programming Guide, Dynamic Parallelism: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html
- CUDA C++ Programming Guide, memory coherence in CDP: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html

Last cross-check date: 2026-03-20
