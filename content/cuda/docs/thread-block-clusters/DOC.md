---
name: thread-block-clusters
description: "CUDA thread block cluster essentials: cluster launch, cluster.sync, distributed shared memory, and portable cluster-size rules."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,thread-block-clusters,cluster,distributed-shared-memory,dsm,cluster.sync,__cluster_dims__,cudaLaunchKernelEx"
---

# CUDA Thread Block Clusters (C++)

Use this page for the CUDA C++ view of cluster launch, cluster-level synchronization, and distributed shared memory.

## What A Cluster Is

Thread Block Clusters add an optional hierarchy level above blocks.

- multiple blocks form one cluster
- blocks in a cluster are co-scheduled on the same GPC
- blocks in the cluster can synchronize and communicate more directly than unrelated blocks

This feature is available on compute capability 9.0 and higher.

## Launch Mechanisms

Clusters can be specified either:

- at compile time with `__cluster_dims__(x, y, z)`
- at launch time with `cudaLaunchKernelEx` and a cluster-dimension attribute

Important:

- `gridDim` still counts blocks, not clusters
- the grid should be compatible with the cluster dimensions

## Cluster Synchronization

CUDA exposes cluster-level synchronization through the Cooperative Groups cluster API.

Typical pattern:

- obtain the cluster handle
- coordinate phases with `cluster.sync()`

This is the cluster-scope analogue of block synchronization, but for blocks that belong to the same cluster.

## Distributed Shared Memory

Blocks in a cluster can access distributed shared memory.

That means:

- a block can read or write shared memory owned by another block in the same cluster
- atomics can also target addresses in distributed shared memory

This is useful when one block's normal shared memory is too small, but full global-memory communication would be too expensive.

## Portable Cluster Size Rule

CUDA documentation describes 8 blocks as the portable maximum cluster size.

- some hardware or configurations may support less
- some architectures can support larger nonportable sizes
- query support instead of hard-coding assumptions

Relevant APIs include occupancy helpers such as `cudaOccupancyMaxPotentialClusterSize`.

## When To Use Clusters

Clusters are a good fit when:

- communication across several neighboring blocks is frequent
- distributed shared memory removes expensive global-memory round trips
- the algorithm naturally decomposes into a few tightly coupled blocks

Avoid them when:

- the kernel is simple enough for ordinary per-block decomposition
- portability matters more than architecture-specific optimization
- the communication pattern is weak or irregular

## Related Topics

- Cooperative Groups: `../cooperative-groups/DOC.md`
- Shared memory usage: `../shared-memory/DOC.md`
- Occupancy tuning: `../occupancy/DOC.md`
- Async copy and TMA: `../async-copy/DOC.md`
- PTX cluster / mbarrier / TMA path: `../ptx/DOC.md`

## Official Source Links (Fact Check)

- CUDA Programming Guide, Thread Block Clusters: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html
- CUDA Programming Guide, modern programming-model introduction to clusters: https://docs.nvidia.com/cuda/archive/13.1.1/cuda-programming-guide/01-introduction/programming-model.html
- Hopper Tuning Guide, distributed shared memory and cluster notes: https://docs.nvidia.com/cuda/archive/12.4.0/hopper-tuning-guide/index.html

Last cross-check date: 2026-03-20
