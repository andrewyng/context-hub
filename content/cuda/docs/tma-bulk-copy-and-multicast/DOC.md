---
name: tma-bulk-copy-and-multicast
description: "Tensor Memory Accelerator (TMA) advanced usage: bulk asynchronous copies, multidimensional bounds checking, and TMA multicast protocols."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-22"
  source: official
  tags: "cuda,ptx,tma,tensor-memory-accelerator,cp.async.bulk,mbarrier,multicast,sm90,sm100,hopper,blackwell"
---

# TMA Bulk Copy and Multicast (C++)

Use this page to leverage the Tensor Memory Accelerator (TMA) introduced in Hopper (SM90) and extended in Blackwell (SM100) to offload data movement from the execution pipelines.

## The Principle of TMA

In standard CUDA paradigms, threads explicitly loop through memory, compute indices, and execute load instructions (`LDG.E`). This consumes registers, SM instruction issue slots, and ALU capabilities.

TMA offloads this entirely. You give an asynchronous memory engine a multi-dimensional descriptor, and it streams a tile of memory directly into Shared Memory without SM thread intervention.

## 1. TMA Descriptors (Host Side)

Before the kernel launches, the CPU must create a TMA Descriptor (`CUtensorMap`).
- The descriptor contains base pointers, tensor dimensions (1D up to 5D), valid strides, and the target block size.
- Important: The descriptor enforces out-of-bounds protection hardware-side. Out-of-bounds fetches evaluate safely to zero, removing the need for `if (row < M)` predicate masks inside the kernel!

## 2. Shared Memory Allocation

TMA requires explicit interaction with `mbarrier` protocols. Memory allocated for TMA must be physically coherent with the block expectations.

## 3. The PTX `cp.async.bulk` Pipeline

The kernel execution loop shifts from thread-driven movement to single-thread capability:
1. One elected thread (often thread `0`) issues the TMA load: `cp.async.bulk.tensor.shared::cluster...`
2. All threads wait on an `mbarrier` synchronized with the copy completion.
3. Compute executes from shared memory (WGMMA or ordinary math).

## TMA Multicast (Cluster Capabilities)

Hopper Thread Block Clusters can share SRAM. TMA Multicast allows a single TMA load from Global Memory to duplicate data across the shared memory of multiple thread blocks within the cluster simultaneously.

- **Use case:** In GEMM, a tile of $A$ can be fetched once from HBM and broadcast hardware-side to all 4 thread blocks in a cluster executing along the $N$ dimension.
- **Instruction:** `.multicast::cluster_modifier` applied to the `cp.async.bulk` instruction.

## Pitfalls

- **Alignment Restrictions:** TMA memory must be 16-byte aligned. Strides of inner dimensions usually must explicitly match contiguous dense formats.
- **Descriptor Modification:** Descriptors are in constant memory and read-only. Modifying them in the kernel for variable sequence lengths requires complex device-side descriptor patching (`cuTensorMapModify`).

## Related Topics

- Thread Block Clusters: `../thread-block-clusters/DOC.md`
- PTX mbarrier patterns: `../ptx-mbarrier-protocol-patterns/DOC.md`
- CuTe Tensors: `../cute-layout-and-tensor-primer/DOC.md`

## Official Source Links (Fact Check)

- CUDA Driver API: Tensor Memory Access (TMA): https://docs.nvidia.com/cuda/cuda-driver-api/group__CUDA__TENSOR__MEMORY.html
- PTX ISA `cp.async.bulk`: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-async-bulk-tensor

Last cross-check date: 2026-03-22
